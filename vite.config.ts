import { defineConfig, loadEnv } from "vite";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import babel from "@rolldown/plugin-babel";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import { VitePWA } from "vite-plugin-pwa";
import { sentryVitePlugin } from "@sentry/vite-plugin";
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
    // VITE_ 접두사 변수는 코드에서 참조하는 순간 클라이언트 번들에 포함되므로 토큰은 GITHUB_TOKEN 만 사용
    const GITHUB_TOKEN = env.GITHUB_TOKEN || "";
    if (!GITHUB_TOKEN && env.VITE_GIT_HUB_TOKEN) {
        console.warn("[vite] VITE_GIT_HUB_TOKEN 은 더 이상 사용하지 않습니다. .env 에서 GITHUB_TOKEN 으로 이름을 바꿔 주세요.");
    }
    const GITHUB_OWNER = getAllowedOwner(env);
    // Sentry 소스맵 업로드: 토큰이 있는 빌드(Vercel)에서만 — 로컬·CI 는 소스맵을 만들지도 올리지도 않음
    const SENTRY_AUTH_TOKEN = env.SENTRY_AUTH_TOKEN || "";

    return {
        plugins: [
            blogContent(),
            react(),
            // React Compiler(안정판 Babel preset) — 컴포넌트·훅 자동 메모이제이션
            babel({ presets: [reactCompilerPreset()] }),
            tailwindcss(),
            VitePWA({
                // autoUpdate 는 새 SW 활성화 시 페이지를 강제 새로고침해 작성 중인 댓글·문의가 사라지므로 배너로 사용자에게 맡김
                registerType: "prompt",
                // dev 환경에서도 SW 동작 확인 가능
                devOptions: { enabled: false },
                // 빌드 시 precache할 파일 패턴
                workbox: {
                    // build.sourcemap 을 따라 sw.js.map 이 공개 배포물에 생기지 않도록 끔
                    sourcemap: false,
                    // SPA 셸 fallback 대상에서 정적 파일·API 제외 (설치 후 /rss.xml 등을 직접 열면 404 페이지가 뜨던 문제)
                    navigateFallbackDenylist: [/^\/api\//, /\.(?:xml|txt|pdf|webmanifest|json)$/],
                    // Detail·Firestore(config) 청크는 블로그 글을 열 때만 필요하므로 첫 방문 precache 에서 제외 (on-demand-scripts 런타임 캐시가 담당)
                    globIgnores: ["**/post-body-*.js", "**/searchPosts-*.js", "**/Detail-*.js", "**/config-*.js", "**/static/en-*.js", "**/static/ja-*.js", "blog/**", "projects/**", "profile/**", "resume/**", "contact/**", "uses/**", "404.html"],
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

                        // ── /api/comments (Vercel 함수 그대로 실행) ──
                        if (urlObj.pathname === "/api/comments") {
                            const chunks: Buffer[] = [];
                            for await (const chunk of req) chunks.push(chunk as Buffer);
                            const raw = Buffer.concat(chunks).toString("utf8");
                            // process.env 에 undefined 를 대입하면 문자열 "undefined" 가 되므로 값이 있을 때만 주입
                            for (const key of ["FIREBASE_SERVICE_ACCOUNT"]) {
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
            // 반드시 마지막 — 최종 번들에 Debug ID 를 넣고 소스맵을 Sentry 로 올린 뒤 배포물에서 .map 삭제 (원본 코드 공개 방지)
            Boolean(SENTRY_AUTH_TOKEN) && sentryVitePlugin({
                org: "llvovll89",
                project: "gh-portfolio",
                authToken: SENTRY_AUTH_TOKEN,
                // 런타임 Sentry.init 의 release(VITE_VERCEL_GIT_COMMIT_SHA)와 같은 값
                release: { name: env.VERCEL_GIT_COMMIT_SHA || undefined },
                sourcemaps: { filesToDeleteAfterUpload: ["./dist/**/*.map"] },
                telemetry: false,
            }),
        ],
        build: {
            // 'hidden': .map 은 만들되 번들에 sourceMappingURL 주석을 남기지 않음 (업로드 후 삭제)
            sourcemap: SENTRY_AUTH_TOKEN ? "hidden" : false,
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
