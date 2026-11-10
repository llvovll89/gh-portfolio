import { defineConfig, loadEnv } from "vite";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import babel from "@rolldown/plugin-babel";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import { VitePWA } from "vite-plugin-pwa";
import { blogContent } from "./build/blogContent";
import { seoPages } from "./build/seo";
import {
    CONTRIBUTIONS_QUERY,
    getAllowedOwner,
    pickGithubParams,
    validateContributionsInput,
    validateGithubPath,
} from "./api/_lib/githubGuard.js";


export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), "");
    // 로컬: VITE_GIT_HUB_TOKEN 또는 GITHUB_TOKEN 모두 지원
    const GITHUB_TOKEN = env.GITHUB_TOKEN || env.VITE_GIT_HUB_TOKEN || "";
    const GITHUB_OWNER = getAllowedOwner(env);

    return {
        plugins: [
            blogContent(),
            react(),
            // React Compiler(안정판 Babel preset) — 컴포넌트·훅 자동 메모이제이션
            babel({ presets: [reactCompilerPreset()] }),
            tailwindcss(),
            VitePWA({
                registerType: "autoUpdate",
                // dev 환경에서도 SW 동작 확인 가능
                devOptions: { enabled: false },
                // 빌드 시 precache할 파일 패턴
                workbox: {
                    globIgnores: ["**/post-body-*.js", "**/searchPosts-*.js", "**/static/en-*.js", "**/static/ja-*.js", "blog/**", "projects/**", "profile/**", "resume/**", "contact/**", "uses/**", "404.html"],
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
                            // Workbox는 RegExp를 전체 href와 비교하므로 pathname으로 매칭 (GET만 캐시됨)
                            urlPattern: ({ url, sameOrigin }) => sameOrigin && url.pathname.startsWith("/api/"),
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
                            const apiPath = validateGithubPath(urlObj.searchParams.get("path") ?? undefined, GITHUB_OWNER);
                            if (!apiPath) {
                                res.writeHead(400, { "Content-Type": "application/json" });
                                res.end(JSON.stringify({ error: "Invalid path" }));
                                return;
                            }

                            const qs = pickGithubParams(urlObj.searchParams).toString();
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
                            const variables = validateContributionsInput({
                                login: urlObj.searchParams.get("login") ?? undefined,
                                from: urlObj.searchParams.get("from") ?? undefined,
                                to: urlObj.searchParams.get("to") ?? undefined,
                            }, GITHUB_OWNER);

                            if (!variables) {
                                res.writeHead(400, { "Content-Type": "application/json" });
                                res.end(JSON.stringify({ error: "Invalid login or date range" }));
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
                                        variables,
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

                        // ── /api/comments, /api/ask (Vercel 함수 그대로 실행) ──
                        if (urlObj.pathname === "/api/comments" || urlObj.pathname === "/api/ask") {
                            const chunks: Buffer[] = [];
                            for await (const chunk of req) chunks.push(chunk as Buffer);
                            const raw = Buffer.concat(chunks).toString("utf8");
                            // process.env 에 undefined 를 대입하면 문자열 "undefined" 가 되므로 값이 있을 때만 주입
                            for (const key of ["FIREBASE_SERVICE_ACCOUNT", "ANTHROPIC_API_KEY"]) {
                                if (!process.env[key] && env[key]) process.env[key] = env[key];
                            }

                            try {
                            const { default: handler } = await server.ssrLoadModule(urlObj.pathname + ".ts") as { default: (req: unknown, res: unknown) => Promise<void> };
                            const shimRes = Object.assign(res, {
                                status(code: number) { res.statusCode = code; return shimRes; },
                                json(data: unknown) {
                                    res.setHeader("Content-Type", "application/json");
                                    res.end(JSON.stringify(data));
                                },
                            });
                            let body: unknown;
                            try { body = raw ? JSON.parse(raw) : null; } catch { body = null; }
                            await handler(Object.assign(req, { body }), shimRes);
                            } catch (err) {
                                // 모듈 로드·핸들러 예외 시 요청이 pending 으로 남지 않도록 500 응답
                                console.error("[dev api]", err);
                                if (!res.headersSent) res.writeHead(500, { "Content-Type": "application/json" });
                                res.end(JSON.stringify({ error: "server-error" }));
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
            // 해시 산출물은 /static 으로 분리 → vercel.json 에서 immutable 캐시 적용
            assetsDir: "static",
            rolldownOptions: {
                output: {
                    chunkFileNames: chunk => chunk.facadeModuleId?.includes("?raw")
                        ? "static/post-body-[hash].js"
                        : "static/[name]-[hash].js",
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
