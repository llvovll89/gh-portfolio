import fs from "node:fs";
import path from "node:path";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import sharp from "sharp";
import type { Plugin } from "vite";
import { projects } from "../src/pages/projects/projectData";
import { careers } from "../src/pages/profile/careerData";
import { parseMarkdownPost, parseHtmlPost, plainSummary, postOgImagePath, type BlogPost } from "../src/utils/postMetadata";
import { slugifyHeading } from "../src/utils/parseToc";

export const SITE_URL = "https://kimgeonho.vercel.app";
export const escapeHtml = (value: string) => value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");

type HeadingProps = { node?: unknown; children?: React.ReactNode };
const headingText = (children: React.ReactNode): string =>
    typeof children === "string" || typeof children === "number" ? String(children)
        : Array.isArray(children) ? children.map(headingText).join("")
            : children && typeof children === "object" && "props" in children ? headingText((children as { props: { children?: React.ReactNode } }).props.children) : "";

/** 클라이언트 MarkdownRender 와 같은 규칙(slugifyHeading + 중복 순번)으로 h2/h3 id 를 붙여 정적 HTML 의 목차 앵커가 동작하게 함 */
function headingIdComponents() {
    const counts = new Map<string, number>();
    const heading = (tag: "h2" | "h3") => ({ node, children, ...rest }: HeadingProps) => {
        void node;
        const base = slugifyHeading(headingText(children));
        const count = (counts.get(base) ?? 0) + 1;
        counts.set(base, count);
        const id = (count > 1 ? base + "-" + count : base) || undefined;
        return createElement(tag, { id, ...rest }, children);
    };
    // 글의 수동 목차는 GitHub 식 `--` 앵커를 쓰므로 heading id 와 같은 규칙으로 정규화 (footnote 등 이미 규칙에 맞는 앵커는 그대로)
    const a = ({ node, href, children, ...rest }: HeadingProps & { href?: string }) => {
        void node;
        const anchor = href?.startsWith("#") ? "#" + slugifyHeading(decodeURIComponent(href.slice(1))) : href;
        return createElement("a", { href: anchor, ...rest }, children);
    };
    return { h2: heading("h2"), h3: heading("h3"), a };
}

const absolute = (pathname: string) => new URL(pathname, SITE_URL).href;
const json = (value: unknown) => JSON.stringify(value).replace(/</g, "\\u003c");
const author = { "@type": "Person", "@id": SITE_URL + "/#person", name: "김건호", alternateName: "Geonho Kim", url: SITE_URL, jobTitle: "Full-stack Web Developer", sameAs: ["https://github.com/llvovll89"] };

const isDate = (value?: string) => !!value && /^\d{4}-\d{2}-\d{2}/.test(value);
const postModified = (post: BlogPost) => isDate(post.updated) ? post.updated : isDate(post.date) ? post.date : undefined;

interface Page {
    pathname: string;
    title: string;
    description: string;
    content: string;
    schema?: Record<string, unknown>;
    article?: BlogPost;
    lastmod?: string;
}

const OG_FONT_DIR = path.resolve("node_modules/pretendard/dist/public/static");
const pangoText = (value: string) => escapeHtml(value).replace(/&#39;/g, "&apos;");

// 텍스트는 Pango(fontfile 지정)로 렌더링 — 빌드 서버(Linux)에 한글 시스템 폰트가 없어도 Pretendard로 그려짐
async function renderOgImage(post: BlogPost, file: string) {
    const text = async (markup: string, weight: "Bold" | "Medium", size: number, width: number) => {
        const { data, info } = await sharp({ text: { text: markup, font: "Pretendard " + weight + " " + size, fontfile: path.join(OG_FONT_DIR, "Pretendard-" + weight + ".otf"), width, rgba: true, wrap: "word", spacing: Math.round(size * .28) } }).png().toBuffer({ resolveWithObject: true });
        return { data, width: info.width, height: info.height };
    };
    const title = post.title.length > 90 ? post.title.slice(0, 88) + "…" : post.title;
    let heading = await text('<span foreground="#f3f6fa">' + pangoText(title) + '</span>', "Bold", 68, 1040);
    for (const size of [56, 46]) {
        if (heading.height <= 270) break;
        heading = await text('<span foreground="#f3f6fa">' + pangoText(title) + '</span>', "Bold", size, 1040);
    }
    // 날짜·태그는 한 줄에 들어갈 때까지 태그 수를 줄임
    let footer: Awaited<ReturnType<typeof text>> | undefined;
    for (let count = Math.min(4, post.tags?.length ?? 0); count >= 0; count--) {
        const meta = [post.date, ...(post.tags ?? []).slice(0, count).map(tag => "#" + tag)].filter(Boolean).join("   ");
        footer = meta ? await text('<span foreground="#a4aab3">' + pangoText(meta) + '</span>', "Medium", 28, 720) : undefined;
        if (!footer || footer.height <= 48) break;
    }
    const site = await text('<span foreground="#75b8e8">kimgeonho.vercel.app</span>', "Medium", 28, 400);
    const label = await text('<span foreground="#75b8e8">GH · Tech Blog</span>', "Bold", 26, 400);
    const background = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#181b20"/><stop offset="1" stop-color="#0c0b10"/></linearGradient></defs><rect width="1200" height="630" fill="url(#g)"/><rect x="0" y="0" width="12" height="630" fill="#75b8e8"/><rect x="80" y="500" width="1040" height="1" fill="#ffffff" fill-opacity=".15"/></svg>');
    await sharp(background).composite([
        { input: label.data, left: 80, top: 72 },
        { input: heading.data, left: 80, top: 132 + Math.max(0, Math.round((300 - heading.height) / 2)) },
        ...(footer ? [{ input: footer.data, left: 80, top: 540 }] : []),
        { input: site.data, left: 1120 - site.width, top: 540 },
    ]).png({ compressionLevel: 9, palette: true }).toFile(file);
}

// 사이트 기본 OG 이미지(1200×630 PNG) — 글 OG 와 같은 디자인 언어로 빌드 시 생성
export const DEFAULT_OG_IMAGE_PATH = "/og/default.png";
async function renderDefaultOgImage(file: string) {
    const text = async (markup: string, weight: "Bold" | "Medium", size: number, width: number) => {
        const { data, info } = await sharp({ text: { text: markup, font: "Pretendard " + weight + " " + size, fontfile: path.join(OG_FONT_DIR, "Pretendard-" + weight + ".otf"), width, rgba: true, wrap: "word", spacing: Math.round(size * .28) } }).png().toBuffer({ resolveWithObject: true });
        return { data, width: info.width, height: info.height };
    };
    const label = await text('<span foreground="#75b8e8">GH · Portfolio</span>', "Bold", 26, 400);
    const name = await text('<span foreground="#f3f6fa">김건호</span><span foreground="#a4aab3">  Geonho Kim</span>', "Bold", 84, 1040);
    const role = await text('<span foreground="#dfe4ea">Full-stack Web Developer</span>', "Medium", 40, 1040);
    const stack = await text('<span foreground="#a4aab3">React · TypeScript · Spring Boot · PostgreSQL</span>', "Medium", 30, 1040);
    const site = await text('<span foreground="#75b8e8">kimgeonho.vercel.app</span>', "Medium", 28, 400);
    const background = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#181b20"/><stop offset="1" stop-color="#0c0b10"/></linearGradient></defs><rect width="1200" height="630" fill="url(#g)"/><rect x="0" y="0" width="12" height="630" fill="#75b8e8"/><rect x="80" y="500" width="1040" height="1" fill="#ffffff" fill-opacity=".15"/></svg>');
    await sharp(background).composite([
        { input: label.data, left: 80, top: 72 },
        { input: name.data, left: 80, top: 200 },
        { input: role.data, left: 80, top: 200 + name.height + 24 },
        { input: stack.data, left: 80, top: 200 + name.height + 24 + role.height + 18 },
        { input: site.data, left: 1120 - site.width, top: 540 },
    ]).png({ compressionLevel: 9, palette: true }).toFile(file);
}

export function seoPages(): Plugin {
    return {
        name: "static-search-pages",
        apply: "build",
        async writeBundle() {
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
            const latestModified = posts.map(postModified).filter(Boolean).sort().pop();
            const projectLinks = projects.map(project => '<li><a href="/projects/' + project.slug + '">' + escapeHtml(project.title) + '</a><p>' + escapeHtml(project.description) + '</p></li>').join("");
            const blogLinks = posts.map(post => '<li><a href="/blog/' + encodeURIComponent(post.slug) + '">' + escapeHtml(post.title) + '</a><p>' + escapeHtml(post.summary ?? "") + '</p></li>').join("");
            const pages: Page[] = [
                { pathname: "/", title: "김건호 | 풀스택 웹 개발자 포트폴리오", description: ko.pages.home.summary, content: '<h1>김건호 · 웹 개발자</h1><p>' + escapeHtml(ko.pages.home.summary) + '</p><h2>프로젝트</h2><ul>' + projectLinks + '</ul>', schema: { "@type": "WebSite", name: "김건호 포트폴리오", url: SITE_URL, author }, lastmod: latestModified },
                { pathname: "/projects", title: "프로젝트 | 김건호", description: "김건호의 웹 프로젝트와 기술 선택, 담당 역할, 구현 경험을 소개합니다.", content: '<h1>프로젝트</h1><ul>' + projectLinks + '</ul>', schema: { "@type": "CollectionPage", name: "프로젝트", url: absolute("/projects") } },
                { pathname: "/blog", title: "블로그 | 김건호", description: "React, TypeScript, 백엔드, 개발 도구와 실무 개념을 기록하는 김건호의 기술 블로그입니다.", content: '<h1>기술 블로그</h1><ul>' + blogLinks + '</ul>', schema: { "@type": "Blog", name: "김건호 기술 블로그", url: absolute("/blog"), author }, lastmod: latestModified },
                { pathname: "/profile", title: "프로필 | 김건호", description: ko.pages.profile.description.intro, content: '<h1>김건호 프로필</h1>' + Object.values(ko.pages.profile.description).map(text => '<p>' + escapeHtml(String(text)) + '</p>').join("") + '<a href="/resume">이력서</a>', schema: { "@type": "ProfilePage", mainEntity: author } },
                { pathname: "/resume", title: "이력서 | 김건호", description: "웹 개발자 김건호의 경력, 기술 스택, 학력과 프로젝트 경험을 확인하세요.", content: '<h1>김건호 이력서</h1><p>' + escapeHtml(ko.pages.resume.description) + '</p><p>React, TypeScript, Java, Spring Boot, PostgreSQL</p><a href="/assets/resume/' + encodeURIComponent("김건호_이력서.pdf") + '">PDF 이력서 다운로드</a> · <a href="/assets/resume/GeonhoKim_Resume_EN.pdf">English resume (PDF)</a>' },
                { pathname: "/contact", title: "연락처 | 김건호", description: ko.pages.contact.subtitle, content: '<h1>연락처</h1><p>' + escapeHtml(ko.pages.contact.subtitle) + '</p><a href="mailto:svvvs5579@naver.com">svvvs5579@naver.com</a>' },
                { pathname: "/uses", title: "사용 도구 | 김건호", description: ko.pages.uses.description, content: '<h1>사용 도구</h1><p>' + escapeHtml(ko.pages.uses.description) + '</p><p>Visual Studio Code, Git, GitHub, Postman, React, TypeScript, Tailwind CSS, Spring Boot, PostgreSQL, Figma, Jira, Slack</p>' },
            ];
            for (const project of projects) {
                pages.push({ pathname: "/projects/" + project.slug, title: project.title + " | 김건호", description: project.description, content: '<h1>' + escapeHtml(project.title) + '</h1><p>' + escapeHtml(project.detailedDescription) + '</p>' + (project.role ? '<h2>담당 범위</h2><p>' + escapeHtml(project.role) + '</p>' : '') + '<h2>기술 스택</h2><p>' + escapeHtml(project.skills.join(", ")) + '</p><a href="' + escapeHtml(project.link.repositoryUrl) + '">GitHub 저장소</a>' + (project.link.projectUrl ? '<a href="' + escapeHtml(project.link.projectUrl) + '">프로젝트 실행</a>' : ''), schema: { "@type": "CreativeWork", name: project.title, description: project.description, url: absolute("/projects/" + project.slug), image: absolute(project.image), creator: author } });
            }
            for (const post of posts) {
                const pathname = "/blog/" + encodeURIComponent(post.slug);
                const body = post.type === "html" ? '<p>' + escapeHtml(plainSummary(post.body, 1000000)) + '</p>' : renderToStaticMarkup(createElement(ReactMarkdown, { remarkPlugins: [remarkGfm], components: headingIdComponents(), children: post.body }));
                pages.push({ pathname, title: post.title + " | 김건호", description: post.summary ?? post.title, article: post, lastmod: postModified(post), content: '<article><h1>' + escapeHtml(post.title) + '</h1><time datetime="' + escapeHtml(post.date) + '">' + escapeHtml(post.date) + '</time>' + body + '</article>', schema: { "@type": "BlogPosting", headline: post.title, description: post.summary, datePublished: post.date || undefined, dateModified: postModified(post), author, publisher: author, inLanguage: "ko", image: absolute(postOgImagePath(post.slug)), mainEntityOfPage: absolute(pathname), url: absolute(pathname) } });
            }
            const nav = '<nav aria-label="주요 메뉴">' + pages.filter(page => page.pathname.split("/").length <= 2).map(page => '<a href="' + page.pathname + '">' + escapeHtml(page.title.split(" |")[0]) + '</a>').join(' · ') + '</nav>';
            const preview = process.env.VERCEL_ENV === "preview";
            for (const page of pages) {
                const url = absolute(page.pathname);
                const breadcrumbs = [{ "@type": "ListItem", position: 1, name: "홈", item: SITE_URL + "/" }];
                // 글·프로젝트 상세는 목록(블로그/프로젝트) 단계를 사이에 둠
                const parent = page.pathname.startsWith("/blog/") ? { name: "블로그", pathname: "/blog" } : page.pathname.startsWith("/projects/") ? { name: "프로젝트", pathname: "/projects" } : null;
                if (parent) breadcrumbs.push({ "@type": "ListItem", position: 2, name: parent.name, item: absolute(parent.pathname) });
                if (page.pathname !== "/") breadcrumbs.push({ "@type": "ListItem", position: breadcrumbs.length + 1, name: page.title.split(" |")[0], item: url });
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
                if (page.article) {
                    meta('property="og:image"', absolute(postOgImagePath(page.article.slug)));
                    meta('name="twitter:image"', absolute(postOgImagePath(page.article.slug)));
                    meta('property="og:image:width"', "1200");
                    meta('property="og:image:height"', "630");
                }
                html = html.replace('</head>', '<link rel="canonical" href="' + escapeHtml(url) + '"><meta name="robots" content="' + (preview ? 'noindex, nofollow' : 'index, follow') + '"><script id="seo-schema" type="application/ld+json" data-url="' + escapeHtml(url) + '">' + json(schema) + '</script></head>');
                // #root 밖(형제)에 두어 createRoot가 지우지 않게 함 → 첫 라우트 커밋 시 App에서 제거 (index.html에서 시각적으로 숨김)
                html = html.replace('<div id="root"></div>', '<main id="seo-content">' + nav + page.content + '</main><div id="root"></div>');
                const dir = page.pathname === "/" ? outDir : path.join(outDir, decodeURIComponent(page.pathname));
                fs.mkdirSync(dir, { recursive: true });
                fs.writeFileSync(path.join(dir, "index.html"), html);
            }
            const sitemap = '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' + pages.map(page => '<url><loc>' + escapeHtml(absolute(page.pathname)) + '</loc>' + (page.lastmod ? '<lastmod>' + escapeHtml(page.lastmod) + '</lastmod>' : '') + '</url>').join('') + '</urlset>';
            fs.writeFileSync(path.join(outDir, "sitemap.xml"), sitemap);
            fs.writeFileSync(path.join(outDir, "robots.txt"), preview ? 'User-agent: *\nDisallow: /\n' : 'User-agent: *\nAllow: /\nDisallow: /api/\nSitemap: ' + SITE_URL + '/sitemap.xml\n');
            const rss = '<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>김건호 기술 블로그</title><link>' + SITE_URL + '/blog</link><description>김건호의 개발 기록</description><language>ko</language>' + posts.map(post => '<item><title>' + escapeHtml(post.title) + '</title><link>' + escapeHtml(absolute('/blog/' + encodeURIComponent(post.slug))) + '</link><guid>' + escapeHtml(absolute('/blog/' + encodeURIComponent(post.slug))) + '</guid><description>' + escapeHtml(post.summary ?? post.title) + '</description>' + (post.date ? '<pubDate>' + new Date(post.date).toUTCString() + '</pubDate>' : '') + '</item>').join('') + '</channel></rss>';
            fs.writeFileSync(path.join(outDir, "rss.xml"), rss);
            // llmstxt.org 형식: H1 → 요약 blockquote → H2 섹션별 링크 목록
            const link = (title: string, pathname: string, description?: string) => '- [' + title.replace(/[[\]]/g, "") + '](' + absolute(pathname) + ')' + (description ? ': ' + description.replace(/\s+/g, " ").trim() : '');
            const llms = [
                '# 김건호 (Geonho Kim) 포트폴리오',
                '',
                '> ' + ko.pages.home.summary,
                '',
                '풀스택 웹 개발자 김건호의 포트폴리오와 기술 블로그입니다. 콘텐츠는 기본적으로 한국어이며 UI는 영어·일본어도 지원합니다. 주요 스택: React, TypeScript, Tailwind CSS, Spring Boot, JPA, PostgreSQL.',
                '',
                '## 주요 페이지',
                ...pages.filter(page => !page.article && !page.pathname.startsWith("/projects/")).map(page => link(page.title.split(" |")[0], page.pathname, page.description)),
                '',
                '## 경력',
                ...careers.map(career => '- ' + career.period + ' ' + ko.pages.profile.personalHistory[career.company] + ' · ' + career.position + (career.active ? ' (재직 중)' : ' · ' + ko.pages.profile.personalHistory.description)),
                '',
                '## 프로젝트',
                // 대표 프로젝트를 먼저, 아카이브 프로젝트는 마지막에 — 역할·결정·수치까지 포함해 AI 요약의 근거로 사용
                ...[...projects].sort((a, b) => Number(a.archived ?? false) - Number(b.archived ?? false)).map(project => link(
                    project.title + (project.archived ? ' (아카이브)' : ''),
                    "/projects/" + project.slug,
                    [project.description, project.role && '역할: ' + project.role, project.outcome && '결과: ' + project.outcome, project.decisions?.length && '설계 결정: ' + project.decisions.join('; '), project.metrics?.length && '수치: ' + project.metrics.join('; '), '기술: ' + project.skills.join(', ')].filter(Boolean).join(' · '),
                )),
                '',
                '## 대표 블로그 글',
                ...posts.filter(post => post.featured).map(post => link(post.title, "/blog/" + encodeURIComponent(post.slug), [post.date, post.summary].filter(Boolean).join(" · "))),
                '',
                '## 최신 블로그 글',
                ...posts.filter(post => post.category !== "Notes" && !post.featured).slice(0, 20).map(post => link(post.title, "/blog/" + encodeURIComponent(post.slug), [post.date, post.summary].filter(Boolean).join(" · "))),
                '',
                '## Optional',
                link("RSS 피드 (전체 글 목록)", "/rss.xml"),
                link("사이트맵", "/sitemap.xml"),
                link("GitHub", "https://github.com/llvovll89"),
                '',
            ].join("\n");
            fs.writeFileSync(path.join(outDir, "llms.txt"), llms);
            const ogDir = path.join(outDir, "og", "posts");
            fs.mkdirSync(ogDir, { recursive: true });
            await renderDefaultOgImage(path.join(outDir, DEFAULT_OG_IMAGE_PATH));
            const queue = [...posts];
            await Promise.all(Array.from({ length: 4 }, async () => {
                for (let post = queue.shift(); post; post = queue.shift()) await renderOgImage(post, path.join(outDir, postOgImagePath(post.slug)));
            }));
            fs.writeFileSync(path.join(outDir, "404.html"), template.replace('<div id="root"></div>', '<div id="root"><main style="padding:32px"><h1>페이지를 찾을 수 없습니다</h1><a href="/">홈으로</a></main></div>').replace('</head>', '<meta name="robots" content="noindex, follow"></head>'));
        },
    };
}
