// 빌드 결과물을 실제 브라우저로 열어 콘솔 에러·axe 접근성 위반을 점검하는 스모크 테스트
// 사용: npm run build && npx vite preview --port 4173 & → node scripts/smoke.mjs [baseUrl] [screenshotDir]
// 시스템에 설치된 Edge/Chrome 을 사용하므로 별도 브라우저 다운로드가 필요 없음
import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { chromium } from "playwright-core";
import { AxeBuilder } from "@axe-core/playwright";

const baseUrl = process.argv[2] ?? "http://localhost:4173";
const shotDir = process.argv[3];
if (shotDir) mkdirSync(shotDir, { recursive: true });

const routes = [
    "/",
    "/projects",
    "/projects/kimgeonho-dev",
    "/profile",
    "/blog",
    "/blog/" + encodeURIComponent("2026-05-04-WebSocket 완벽 정리"),
    "/resume",
    "/uses",
    "/contact",
    "/does-not-exist",
];
const themes = { light: "light", dark: "bg-black" };
// 실제 Firestore 조회수 증가·GA 수집을 일으키지 않도록 외부 요청 차단
const BLOCKED = /firestore\.googleapis\.com|firebaseio\.com|googletagmanager\.com|google-analytics\.com|api\.emailjs\.com/;
const IGNORED_CONSOLE = /ERR_FAILED|ERR_BLOCKED|net::|Firestore|firestore|Failed to load resource|BlogComments|GA_ID/;

const channel = process.platform === "win32" ? "msedge" : "chrome";
const browser = await chromium.launch({ channel, args: ["--no-sandbox"] });
const results = [];

for (const [themeName, mode] of Object.entries(themes)) {
    const context = await browser.newContext({ reducedMotion: "reduce", viewport: { width: 1366, height: 860 }, colorScheme: themeName === "dark" ? "dark" : "light" });
    await context.addInitScript(([themeMode]) => {
        localStorage.setItem("portfolio-theme-settings", JSON.stringify({ mode: themeMode }));
    }, [mode]);
    await context.route(BLOCKED, route => route.abort());

    for (const path of routes) {
        const page = await context.newPage();
        const errors = [];
        page.on("console", msg => { if (msg.type() === "error" && !IGNORED_CONSOLE.test(msg.text())) errors.push(msg.text()); });
        page.on("pageerror", err => errors.push("pageerror: " + err.message));

        await page.goto(baseUrl + path, { waitUntil: "networkidle" });
        const mounted = await page.waitForSelector("#main-content, #detail-content", { timeout: 15000 }).then(() => true, () => false);
        if (!mounted) errors.push("main content did not become visible");
        // 프리렌더 콘텐츠가 앱으로 교체되었는지 확인
        const prerenderLeft = await page.locator("#seo-content").count();
        await page.waitForTimeout(400);

        const axe = await new AxeBuilder({ page })
            .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
            .analyze();
        const violations = axe.violations.map(v => ({ id: v.id, impact: v.impact, nodes: v.nodes.length, sample: v.nodes[0]?.target.join(" ") }));

        if (shotDir) {
            const name = `${themeName}-${path === "/" ? "home" : path.split("/").filter(Boolean).map(decodeURIComponent).join("_").replace(/[^\w가-힣-]+/g, "-")}.png`;
            await page.screenshot({ path: join(shotDir, name) });
        }
        results.push({ theme: themeName, path, title: await page.title(), errors, prerenderLeft, violations });
        await page.close();
    }
    await context.close();
}
await browser.close();

let failed = false;
for (const r of results) {
    const ok = r.errors.length === 0 && r.prerenderLeft === 0;
    if (!ok) failed = true;
    console.log(`${ok ? "✓" : "✗"} [${r.theme}] ${decodeURIComponent(r.path)} — ${r.title}`);
    for (const e of r.errors) console.log("    console: " + e.slice(0, 200));
    if (r.prerenderLeft) console.log("    #seo-content was not removed");
    for (const v of r.violations) console.log(`    axe ${v.impact} ${v.id} ×${v.nodes} (${v.sample})`);
}
process.exit(failed ? 1 : 0);
