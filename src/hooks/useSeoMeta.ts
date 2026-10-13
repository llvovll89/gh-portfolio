import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";

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
export function useSeoMeta({ title, description, image = DEFAULT_IMAGE, url, type = "website", noIndex = false, publishedTime }: SeoMetaOptions = {}) {
    const location = useLocation();
    const { t, i18n } = useTranslation();
    const fullTitle = title ? title + " | GH Portfolio" : t("seo.title");
    const summary = description ?? t("seo.description");
    const fullUrl = new URL(url ?? location.pathname, SITE_URL).href;
    const fullImage = new URL(image, SITE_URL).href;
    const language = i18n.resolvedLanguage ?? "ko";
    useEffect(() => {
        document.title = fullTitle;
        setMeta("name", "description", summary);
        setMeta("name", "robots", noIndex ? "noindex, follow" : "index, follow");
        for (const [key, value] of Object.entries({ title: fullTitle, description: summary, image: fullImage, url: fullUrl, type, locale: language === "ko" ? "ko_KR" : language === "ja" ? "ja_JP" : "en_US" })) setMeta("property", "og:" + key, value);
        for (const [key, value] of Object.entries({ title: fullTitle, description: summary, image: fullImage, url: fullUrl, card: "summary_large_image" })) setMeta("name", "twitter:" + key, value);
        setMeta("property", "article:published_time", publishedTime ?? "");
        let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
        if (!canonical) { canonical = document.createElement("link"); canonical.rel = "canonical"; document.head.appendChild(canonical); }
        canonical.href = fullUrl;
        let schema = document.getElementById("seo-schema");
        if (!schema) { schema = document.createElement("script"); schema.id = "seo-schema"; schema.setAttribute("type", "application/ld+json"); document.head.appendChild(schema); }
        const person = { "@type": "Person", "@id": SITE_URL + "/#person", name: "김건호", alternateName: "Geon Ho Kim", url: SITE_URL, sameAs: ["https://github.com/llvovll89"] };
        schema.textContent = JSON.stringify({ "@context": "https://schema.org", "@graph": [person, { "@type": type === "article" ? "BlogPosting" : "WebPage", name: fullTitle, headline: fullTitle, description: summary, url: fullUrl, image: fullImage, mainEntityOfPage: fullUrl, inLanguage: type === "article" ? "ko" : language, ...(type === "article" ? { author: person, datePublished: publishedTime } : {}) }] });
    }, [fullTitle, summary, fullImage, fullUrl, type, noIndex, publishedTime, language]);
}
