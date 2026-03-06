import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

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
