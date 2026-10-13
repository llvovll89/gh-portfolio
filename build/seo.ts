import fs from "node:fs";
import path from "node:path";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Plugin } from "vite";
import { projects } from "../src/pages/projects/mocks/projectData";
import { parseMarkdownPost, parseHtmlPost, plainSummary, type BlogPost } from "../src/utils/postMetadata";

export const SITE_URL = "https://kimgeonho.vercel.app";
export const escapeHtml = (value: string) => value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
const absolute = (pathname: string) => new URL(pathname, SITE_URL).href;
const json = (value: unknown) => JSON.stringify(value).replace(/</g, "\\u003c");
const author = { "@type": "Person", "@id": SITE_URL + "/#person", name: "김건호", alternateName: "Geon Ho Kim", url: SITE_URL, jobTitle: "Full-stack Web Developer", sameAs: ["https://github.com/llvovll89"] };

interface Page {
    pathname: string;
    title: string;
    description: string;
    content: string;
    schema?: Record<string, unknown>;
    article?: BlogPost;
}

export function seoPages(): Plugin {
    return {
        name: "static-search-pages",
        apply: "build",
        writeBundle() {
            const outDir = path.resolve("dist");
            const template = fs.readFileSync(path.join(outDir, "index.html"), "utf8");
            const ko = JSON.parse(fs.readFileSync("src/i18n/locales/ko.json", "utf8"));
            const posts: BlogPost[] = [];
            for (const [dir, extension, parse] of [
                ["src/content/posts", ".md", parseMarkdownPost],
                ["src/content/organizingfiles", ".html", parseHtmlPost],
            ] as const) {
                for (const file of fs.readdirSync(dir).filter(file => file.endsWith(extension))) {
                    posts.push(parse(file, fs.readFileSync(path.join(dir, file), "utf8")));
                }
            }
            posts.sort((a,b) => b.date.localeCompare(a.date));
            const projectLinks = projects.map(project => '<li><a href="/projects/' + project.slug + '">' + escapeHtml(project.title) + '</a><p>' + escapeHtml(project.description) + '</p></li>').join("");
            const blogLinks = posts.map(post => '<li><a href="/blog/' + encodeURIComponent(post.slug) + '">' + escapeHtml(post.title) + '</a><p>' + escapeHtml(post.summary ?? "") + '</p></li>').join("");
            const pages: Page[] = [
                { pathname: "/", title: "김건호 | 풀스택 웹 개발자 포트폴리오", description: ko.pages.home.summary, content: '<h1>김건호 · 웹 개발자</h1><p>' + escapeHtml(ko.pages.home.summary) + '</p><h2>프로젝트</h2><ul>' + projectLinks + '</ul>', schema: { "@type": "WebSite", name: "김건호 포트폴리오", url: SITE_URL, author } },
                { pathname: "/projects", title: "프로젝트 | 김건호", description: "김건호의 웹 프로젝트와 기술 선택, 담당 역할, 구현 경험을 소개합니다.", content: '<h1>프로젝트</h1><ul>' + projectLinks + '</ul>', schema: { "@type": "CollectionPage", name: "프로젝트", url: absolute("/projects") } },
                { pathname: "/blog", title: "기술 블로그 | 김건호", description: "React, TypeScript, 백엔드, 개발 도구와 실무 개념을 기록하는 김건호의 기술 블로그입니다.", content: '<h1>기술 블로그</h1><ul>' + blogLinks + '</ul>', schema: { "@type": "Blog", name: "김건호 기술 블로그", url: absolute("/blog"), author } },
                { pathname: "/profile", title: "프로필 | 김건호", description: ko.pages.profile.description.intro, content: '<h1>김건호 프로필</h1>' + Object.values(ko.pages.profile.description).map(text => '<p>' + escapeHtml(String(text)) + '</p>').join("") + '<a href="/resume">이력서</a>', schema: { "@type": "ProfilePage", mainEntity: author } },
                { pathname: "/resume", title: "이력서 | 김건호", description: "웹 개발자 김건호의 경력, 기술 스택, 학력과 프로젝트 경험을 확인하세요.", content: '<h1>김건호 이력서</h1><p>' + escapeHtml(ko.pages.resume.description) + '</p><p>React, TypeScript, Java, Spring Boot, PostgreSQL</p><a href="/assets/resume/' + encodeURIComponent("김건호_이력서.pdf") + '">PDF 이력서 다운로드</a>' },
                { pathname: "/contact", title: "연락처 | 김건호", description: ko.pages.contact.subtitle, content: '<h1>연락처</h1><p>' + escapeHtml(ko.pages.contact.subtitle) + '</p><a href="mailto:svvvs5579@naver.com">svvvs5579@naver.com</a>' },
                { pathname: "/uses", title: "사용 도구 | 김건호", description: ko.pages.uses.description, content: '<h1>사용 도구</h1><p>' + escapeHtml(ko.pages.uses.description) + '</p><p>Visual Studio Code, Git, GitHub, Postman, React, TypeScript, Tailwind CSS, Spring Boot, PostgreSQL, Figma, Jira, Slack</p>' },
            ];
            for (const project of projects) {
                pages.push({ pathname: "/projects/" + project.slug, title: project.title + " | 김건호 프로젝트", description: project.description, content: '<h1>' + escapeHtml(project.title) + '</h1><p>' + escapeHtml(project.detailedDescription) + '</p>' + (project.role ? '<h2>담당 범위</h2><p>' + escapeHtml(project.role) + '</p>' : '') + '<h2>기술 스택</h2><p>' + escapeHtml(project.skills.join(", ")) + '</p><a href="' + escapeHtml(project.link.repositoryUrl) + '">GitHub 저장소</a>' + (project.link.projectUrl ? '<a href="' + escapeHtml(project.link.projectUrl) + '">프로젝트 실행</a>' : ''), schema: { "@type": "CreativeWork", name: project.title, description: project.description, url: absolute("/projects/" + project.slug), image: absolute(project.image), creator: author } });
            }
            for (const post of posts) {
                const pathname = "/blog/" + encodeURIComponent(post.slug);
                const body = post.type === "html" ? '<p>' + escapeHtml(plainSummary(post.body, 1000000)) + '</p>' : renderToStaticMarkup(createElement(ReactMarkdown, { remarkPlugins: [remarkGfm], children: post.body }));
                pages.push({ pathname, title: post.title + " | 김건호 블로그", description: post.summary ?? post.title, article: post, content: '<article><h1>' + escapeHtml(post.title) + '</h1><time datetime="' + escapeHtml(post.date) + '">' + escapeHtml(post.date) + '</time>' + body + '</article>', schema: { "@type": "BlogPosting", headline: post.title, description: post.summary, datePublished: post.date || undefined, author, publisher: author, inLanguage: "ko", image: absolute("/og/thumbnail.webp"), mainEntityOfPage: absolute(pathname), url: absolute(pathname) } });
            }
            const nav = '<nav aria-label="주요 메뉴">' + pages.filter(page => page.pathname.split("/").length <= 2).map(page => '<a href="' + page.pathname + '">' + escapeHtml(page.title.split(" |")[0]) + '</a>').join(' · ') + '</nav>';
            const preview = process.env.VERCEL_ENV === "preview";
            for (const page of pages) {
                const url = absolute(page.pathname);
                const breadcrumbs = [{ "@type": "ListItem", position: 1, name: "홈", item: SITE_URL + "/" }];
                if (page.pathname !== "/") breadcrumbs.push({ "@type": "ListItem", position: 2, name: page.title.split(" |")[0], item: url });
                const schema = { "@context": "https://schema.org", "@graph": [author, ...(page.schema ? [page.schema] : []), { "@type": "BreadcrumbList", itemListElement: breadcrumbs }] };
                let html = template.replace(/<title>[^<]*<\/title>/, '<title>' + escapeHtml(page.title) + '</title>');
                const meta = (selector: string, value: string) => {
                    const re = new RegExp('(<meta\\s+' + selector + '\\s+content=")[^"]*("\\s*/?>)', 'i');
                    html = html.replace(re, (_all, before, after) => before + escapeHtml(value) + after);
                };
                meta('name="description"', page.description);
                meta('property="og:title"', page.title);
                meta('property="og:description"', page.description);
                meta('property="og:url"', url);
                meta('property="og:type"', page.article ? "article" : "website");
                meta('name="twitter:title"', page.title);
                meta('name="twitter:description"', page.description);
                html = html.replace('</head>', '<link rel="canonical" href="' + escapeHtml(url) + '"><meta name="robots" content="' + (preview ? 'noindex, nofollow' : 'index, follow') + '"><script id="seo-schema" type="application/ld+json">' + json(schema) + '</script></head>');
                html = html.replace('<div id="root"></div>', '<div id="root"><main id="seo-content" style="max-width:960px;margin:32px auto;padding:16px;line-height:1.8">' + nav + page.content + '</main></div>');
                const dir = page.pathname === "/" ? outDir : path.join(outDir, decodeURIComponent(page.pathname));
                fs.mkdirSync(dir, { recursive: true });
                fs.writeFileSync(path.join(dir, "index.html"), html);
            }
            const sitemap = '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' + pages.map(page => '<url><loc>' + escapeHtml(absolute(page.pathname)) + '</loc></url>').join('') + '</urlset>';
            fs.writeFileSync(path.join(outDir, "sitemap.xml"), sitemap);
            fs.writeFileSync(path.join(outDir, "robots.txt"), preview ? 'User-agent: *\nDisallow: /\n' : 'User-agent: *\nAllow: /\nDisallow: /api/\nSitemap: ' + SITE_URL + '/sitemap.xml\n');
            const rss = '<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>김건호 기술 블로그</title><link>' + SITE_URL + '/blog</link><description>김건호의 개발 기록</description><language>ko</language>' + posts.map(post => '<item><title>' + escapeHtml(post.title) + '</title><link>' + escapeHtml(absolute('/blog/' + encodeURIComponent(post.slug))) + '</link><guid>' + escapeHtml(absolute('/blog/' + encodeURIComponent(post.slug))) + '</guid><description>' + escapeHtml(post.summary ?? post.title) + '</description>' + (post.date ? '<pubDate>' + new Date(post.date).toUTCString() + '</pubDate>' : '') + '</item>').join('') + '</channel></rss>';
            fs.writeFileSync(path.join(outDir, "rss.xml"), rss);
            fs.writeFileSync(path.join(outDir, "404.html"), template.replace('<div id="root"></div>', '<div id="root"><main style="padding:32px"><h1>페이지를 찾을 수 없습니다</h1><a href="/">홈으로</a></main></div>').replace('</head>', '<meta name="robots" content="noindex, follow"></head>'));
        },
    };
}
