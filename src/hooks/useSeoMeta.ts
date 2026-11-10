import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { postOgImagePath } from "../utils/postMetadata";

const SITE_URL = "https://kimgeonho.vercel.app";
const DEFAULT_IMAGE = SITE_URL + "/og/thumbnail.webp";
interface SeoMetaOptions {
    title?: string;
    description?: string;
    image?: string;
    url?: string;
    type?: "website" | "article";
    noIndex?: boolean;
    publishedTime?: string;
}
function setMeta(kind: "name" | "property", name: string, content: string) {
    let meta = document.head.querySelector<HTMLMetaElement>('meta[' + kind + '="' + name + '"]');
    if (!meta) { meta = document.createElement("meta"); meta.setAttribute(kind, name); document.head.appendChild(meta); }
    meta.content = content;
}
const safeDecode = (value: string) => { try { return decodeURIComponent(value); } catch { return value; } };
// 빌드(build/seo.ts)의 encodeURIComponent(slug) 경로와 같은 형태로 정규화해 canonical·스키마 URL 비교를 일치시킴
const normalizeUrl = (value: string) => {
    const url = new URL(value, SITE_URL);
    url.pathname = url.pathname.split("/").map(segment => encodeURIComponent(safeDecode(segment))).join("/");
    return url.href;
};
export function useSeoMeta({ title, description, image, url, type = "website", noIndex = false, publishedTime }: SeoMetaOptions = {}) {
    const location = useLocation();
    const { t, i18n } = useTranslation();
    const fullTitle = title ? title + " | GH Portfolio" : t("seo.title");
    const summary = description ?? t("seo.description");
    const fullUrl = normalizeUrl(url ?? location.pathname);
    const postSlug = type === "article" ? new URL(fullUrl).pathname.match(/^\/blog\/([^/]+)$/)?.[1] : undefined;
    const fullImage = new URL(image ?? (postSlug ? postOgImagePath(safeDecode(postSlug)) : DEFAULT_IMAGE), SITE_URL).href;
    const language = i18n.resolvedLanguage ?? "ko";
    useEffect(() => {
        document.title = fullTitle;
        setMeta("name", "description", summary);
        setMeta("name", "robots", noIndex ? "noindex, follow" : "index, follow");
        for (const [key, value] of Object.entries({ title: fullTitle, description: summary, image: fullImage, url: fullUrl, type, locale: language === "ko" ? "ko_KR" : language === "ja" ? "ja_JP" : "en_US" })) setMeta("property", "og:" + key, value);
        for (const [key, value] of Object.entries({ title: fullTitle, description: summary, image: fullImage, url: fullUrl, card: "summary_large_image" })) setMeta("name", "twitter:" + key, value);
        // 크기를 아는 이미지(포스트 OG 1200×630, 기본 썸네일 1024×1024)만 명시하고 그 외엔 제거
        const imageSize = image ? undefined : postSlug ? ["1200", "630"] : ["1024", "1024"];
        for (const [index, key] of ["og:image:width", "og:image:height"].entries()) {
            if (imageSize) setMeta("property", key, imageSize[index]);
            else document.head.querySelector('meta[property="' + key + '"]')?.remove();
        }
        setMeta("property", "article:published_time", publishedTime ?? "");
        let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
        if (!canonical) { canonical = document.createElement("link"); canonical.rel = "canonical"; document.head.appendChild(canonical); }
        canonical.href = fullUrl;
        let schema = document.getElementById("seo-schema");
        // 빌드 시 생성된 더 풍부한 JSON-LD가 현재 URL과 같으면 유지 — 클라이언트 이동으로 URL이 바뀔 때만 교체
        const prerenderedUrl = schema?.dataset.url;
        if (prerenderedUrl && normalizeUrl(prerenderedUrl) === fullUrl) return;
        if (!schema) { schema = document.createElement("script"); schema.id = "seo-schema"; schema.setAttribute("type", "application/ld+json"); document.head.appendChild(schema); }
        delete schema.dataset.url;
        const person = { "@type": "Person", "@id": SITE_URL + "/#person", name: "김건호", alternateName: "Geonho Kim", url: SITE_URL, sameAs: ["https://github.com/llvovll89"] };
        schema.textContent = JSON.stringify({ "@context": "https://schema.org", "@graph": [person, { "@type": type === "article" ? "BlogPosting" : "WebPage", name: fullTitle, headline: fullTitle, description: summary, url: fullUrl, image: fullImage, mainEntityOfPage: fullUrl, inLanguage: type === "article" ? "ko" : language, ...(type === "article" ? { author: person, datePublished: publishedTime } : {}) }] });
    }, [fullTitle, summary, fullImage, fullUrl, type, noIndex, publishedTime, language, image, postSlug]);
}
