import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import fs from "node:fs";
import { VitePWA } from "vite-plugin-pwa";

// ── Blog OG tag generator helpers ──────────────────────────────────────────

function parseMdFrontmatter(raw: string): { title: string; summary?: string } {
    const trimmed = raw.replace(/^\uFEFF/, "");
    if (!trimmed.startsWith("---")) return { title: "" };
    const end = trimmed.indexOf("\n---", 3);
    if (end === -1) return { title: "" };
    const fm: Record<string, string> = {};
    for (const line of trimmed.slice(3, end).split("\n")) {
        const idx = line.indexOf(":");
        if (idx === -1) continue;
        fm[line.slice(0, idx).trim()] = line.slice(idx + 1).trim().replace(/^["']|["']$/g, "");
    }
    return { title: fm.title ?? "", summary: fm.summary };
}

function escHtml(s: string) {
    return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function injectBlogOg(html: string, meta: { title: string; description: string; url: string }) {
    const t = escHtml(meta.title);
    const d = escHtml(meta.description);
    const u = escHtml(meta.url);
    return html
        .replace(/<title>[^<]*<\/title>/, `<title>${t}</title>`)
        .replace(/(<meta\s+property="og:title"\s+content=")[^"]*(")/i, `$1${t}$2`)
        .replace(/(<meta\s+property="og:description"\s+content=")[^"]*(")/i, `$1${d}$2`)
        .replace(/(<meta\s+property="og:url"\s+content=")[^"]*(")/i, `$1${u}$2`)
        .replace(/(<meta\s+name="twitter:title"\s+content=")[^"]*(")/i, `$1${t}$2`)
        .replace(/(<meta\s+name="twitter:description"\s+content=")[^"]*(")/i, `$1${d}$2`);
}

const ALLOWED_PATH = /^\/repos\/[^/]+\/[^/]+(?:\/(?:branches|commits|issues|pulls))?$|^\/users\/[^/]+\/events$/;

const CONTRIBUTIONS_QUERY = `
query ($login: String!, $from: DateTime!, $to: DateTime!) {
  user(login: $login) {
    contributionsCollection(from: $from, to: $to) {
      contributionCalendar {
        totalContributions
        weeks { contributionDays { date contributionCount color } }
      }
    }
  }
}`;

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), "");
    // 로컬: VITE_GIT_HUB_TOKEN 또는 GITHUB_TOKEN 모두 지원
    const GITHUB_TOKEN = env.GITHUB_TOKEN || env.VITE_GIT_HUB_TOKEN || "";

    return {
        plugins: [
            react(),
            tailwindcss(),
            VitePWA({
                registerType: "autoUpdate",
                // dev 환경에서도 SW 동작 확인 가능
                devOptions: { enabled: false },
                // 빌드 시 precache할 파일 패턴
                workbox: {
                    globPatterns: [
                        "**/*.{js,css,html,ico,png,svg,webp,woff,woff2}",
                    ],
                    // /api/* 는 NetworkFirst (GitHub API 프록시, 5분 캐시)
                    runtimeCaching: [
                        {
                            urlPattern: /^\/api\//,
                            handler: "NetworkFirst",
                            options: {
                                cacheName: "api-cache",
                                networkTimeoutSeconds: 5,
                                expiration: {
                                    maxEntries: 20,
                                    maxAgeSeconds: 60 * 5, // 5분
                                },
                                cacheableResponse: { statuses: [0, 200] },
                            },
                        },
                        // 폰트 CacheFirst (변경 빈도 매우 낮음)
                        {
                            urlPattern: /\/assets\/font\//,
                            handler: "CacheFirst",
                            options: {
                                cacheName: "font-cache",
                                expiration: {
                                    maxEntries: 30,
                                    maxAgeSeconds: 60 * 60 * 24 * 365, // 1년
                                },
                                cacheableResponse: { statuses: [0, 200] },
                            },
                        },
                        // 이미지 CacheFirst
                        {
                            urlPattern: /\/assets\/images\//,
                            handler: "CacheFirst",
                            options: {
                                cacheName: "image-cache",
                                expiration: {
                                    maxEntries: 60,
                                    maxAgeSeconds: 60 * 60 * 24 * 30, // 30일
                                },
                                cacheableResponse: { statuses: [0, 200] },
                            },
                        },
                    ],
                },
                // Web App Manifest
                manifest: {
                    name: "김건호 포트폴리오",
                    short_name: "GH Portfolio",
                    description: "웹 개발자 김건호의 포트폴리오 및 블로그",
                    theme_color: "#0c0b10",
                    background_color: "#0c0b10",
                    display: "standalone",
                    start_url: "/",
                    scope: "/",
                    lang: "ko",
                    icons: [
                        {
                            src: "/assets/logo/GH_logo_small_white.png",
                            sizes: "192x192",
                            type: "image/png",
                        },
                        {
                            src: "/assets/logo/GH_logo_large_white.png",
                            sizes: "512x512",
                            type: "image/png",
                        },
                        {
                            src: "/assets/logo/GH_logo_large_white.png",
                            sizes: "512x512",
                            type: "image/png",
                            purpose: "maskable",
                        },
                    ],
                },
            }),
            {
                name: "vercel-api-dev",
                configureServer(server) {
                    server.middlewares.use(async (req, res, next) => {
                        const urlObj = new URL(req.url!, "http://localhost");

                        // ── /api/github ─────────────────────────────────────
                        if (urlObj.pathname === "/api/github") {
                            const apiPath = urlObj.searchParams.get("path");
                            if (!apiPath || !ALLOWED_PATH.test(apiPath)) {
                                res.writeHead(400, { "Content-Type": "application/json" });
                                res.end(JSON.stringify({ error: "Invalid path" }));
                                return;
                            }

                            const params = new URLSearchParams();
                            for (const [k, v] of urlObj.searchParams) {
                                if (k !== "path") params.set(k, v);
                            }
                            const qs = params.toString();
                            const url = `https://api.github.com${apiPath}${qs ? `?${qs}` : ""}`;

                            const headers: Record<string, string> = {
                                Accept: "application/vnd.github+json",
                                "X-GitHub-Api-Version": "2022-11-28",
                                "User-Agent": "gh-portfolio",
                            };
                            if (GITHUB_TOKEN) headers["Authorization"] = `Bearer ${GITHUB_TOKEN}`;

                            try {
                                const upstream = await fetch(url, { headers });
                                const data = await upstream.text();
                                res.writeHead(upstream.status, { "Content-Type": "application/json" });
                                res.end(data);
                            } catch {
                                res.writeHead(502, { "Content-Type": "application/json" });
                                res.end(JSON.stringify({ error: "Upstream request failed" }));
                            }
                            return;
                        }

                        // ── /api/contributions ───────────────────────────────
                        if (urlObj.pathname === "/api/contributions") {
                            const login = urlObj.searchParams.get("login");
                            const from = urlObj.searchParams.get("from");
                            const to = urlObj.searchParams.get("to");

                            if (!login || !from || !to) {
                                res.writeHead(400, { "Content-Type": "application/json" });
                                res.end(JSON.stringify({ error: "login, from, to are required" }));
                                return;
                            }
                            if (!GITHUB_TOKEN) {
                                res.writeHead(503, { "Content-Type": "application/json" });
                                res.end(JSON.stringify({ error: "GitHub token not configured" }));
                                return;
                            }

                            try {
                                const upstream = await fetch("https://api.github.com/graphql", {
                                    method: "POST",
                                    headers: {
                                        "Content-Type": "application/json",
                                        Authorization: `Bearer ${GITHUB_TOKEN}`,
                                    },
                                    body: JSON.stringify({
                                        query: CONTRIBUTIONS_QUERY,
                                        variables: { login, from, to },
                                    }),
                                });
                                const data = await upstream.text();
                                res.writeHead(upstream.status, { "Content-Type": "application/json" });
                                res.end(data);
                            } catch {
                                res.writeHead(502, { "Content-Type": "application/json" });
                                res.end(JSON.stringify({ error: "Upstream request failed" }));
                            }
                            return;
                        }

                        next();
                    });
                },
            },
            // ── Blog OG HTML generator (build only) ─────────────────────
            {
                name: "blog-og-generator",
                apply: "build",
                writeBundle() {
                    const outDir = path.resolve("dist");
                    const indexPath = path.join(outDir, "index.html");
                    if (!fs.existsSync(indexPath)) return;
                    const indexHtml = fs.readFileSync(indexPath, "utf-8");
                    const baseUrl = "https://kimgeonho.vercel.app";

                    // .md posts
                    const postsDir = path.resolve("src/content/posts");
                    if (fs.existsSync(postsDir)) {
                        for (const filename of fs.readdirSync(postsDir).filter((f: string) => f.endsWith(".md"))) {
                            const slug = filename.replace(/\.md$/, "");
                            const raw = fs.readFileSync(path.join(postsDir, filename), "utf-8");
                            const { title, summary } = parseMdFrontmatter(raw);
                            const slugDir = path.join(outDir, "blog", slug);
                            fs.mkdirSync(slugDir, { recursive: true });
                            fs.writeFileSync(path.join(slugDir, "index.html"), injectBlogOg(indexHtml, {
                                title: title ? `${title} | GH Portfolio` : "GH Portfolio",
                                description: summary ?? title ?? "웹 개발자 김건호의 포트폴리오 및 블로그",
                                url: `${baseUrl}/blog/${encodeURIComponent(slug)}`,
                            }));
                        }
                    }

                    // .html posts
                    const htmlDir = path.resolve("src/content/organizingfiles");
                    if (fs.existsSync(htmlDir)) {
                        for (const filename of fs.readdirSync(htmlDir).filter((f: string) => f.endsWith(".html"))) {
                            const base = filename.replace(/\.html$/, "");
                            const dateMatch = base.match(/^(\d{4}-\d{2}-\d{2})-(.+)$/);
                            const slug = dateMatch ? "html-" + dateMatch[2] : "html-" + base;
                            const raw = fs.readFileSync(path.join(htmlDir, filename), "utf-8");
                            const titleMatch = raw.match(/<title[^>]*>([^<]+)<\/title>/i);
                            const title = titleMatch?.[1]?.trim() ?? slug;
                            const descMatch =
                                raw.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i) ??
                                raw.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']description["']/i);
                            const summary = descMatch?.[1]?.trim() ?? title;
                            const slugDir = path.join(outDir, "blog", slug);
                            fs.mkdirSync(slugDir, { recursive: true });
                            fs.writeFileSync(path.join(slugDir, "index.html"), injectBlogOg(indexHtml, {
                                title: `${title} | GH Portfolio`,
                                description: summary,
                                url: `${baseUrl}/blog/${encodeURIComponent(slug)}`,
                            }));
                        }
                    }
                },
            },
        ],
        server: {
            port: 3001,
            host: true,
        },
        resolve: {
            alias: {
                "@": path.resolve(__dirname, "src"),
            },
        },
    };
});
