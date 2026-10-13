import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import { VitePWA } from "vite-plugin-pwa";
import { blogContent } from "./build/blogContent";
import { seoPages } from "./build/seo";

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
            blogContent(),
            react(),
            tailwindcss(),
            VitePWA({
                registerType: "autoUpdate",
                // dev 환경에서도 SW 동작 확인 가능
                devOptions: { enabled: false },
                // 빌드 시 precache할 파일 패턴
                workbox: {
                    globIgnores: ["**/post-body-*.js", "**/searchPosts-*.js", "blog/**", "projects/**", "profile/**", "resume/**", "contact/**", "uses/**", "404.html"],
                    globPatterns: [
                        "**/*.{js,css,html,ico,svg}",
                        "assets/logo/*.png",
                        "og/*.webp",
                    ],
                    // /api/* 는 NetworkFirst (GitHub API 프록시, 5분 캐시)
                    runtimeCaching: [
                        {
                            urlPattern: ({ request, sameOrigin }) => request.destination === "script" && sameOrigin,
                            handler: "CacheFirst",
                            options: { cacheName: "on-demand-scripts", expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 30 } },
                        },
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
                            urlPattern: ({ request, sameOrigin }) => request.destination === "font" && sameOrigin,
                            handler: "CacheFirst",
                            options: {
                                cacheName: "font-cache",
                                expiration: {
                                    maxEntries: 100,
                                    maxAgeSeconds: 60 * 60 * 24 * 365, // 1년
                                },
                                cacheableResponse: { statuses: [0, 200] },
                            },
                        },
                        // 이미지 CacheFirst
                        {
                            urlPattern: /\/assets\/(?:images|optimized)\//,
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
            seoPages(),
        ],
        build: {
            rollupOptions: {
                output: {
                    chunkFileNames: chunk => chunk.facadeModuleId?.includes("?raw")
                        ? "assets/post-body-[hash].js"
                        : "assets/[name]-[hash].js",
                },
            },
        },
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
