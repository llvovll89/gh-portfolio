import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { resolve } from "node:path";
import { createHash } from "node:crypto";
import { test } from "node:test";
import assert from "node:assert/strict";
import ts from "typescript";

const require = createRequire(import.meta.url);
function loadTypeScript(file) {
    const source = ts.transpileModule(readFileSync(resolve(file), "utf8"), {
        compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
    }).outputText;
    const exports = {};
    new Function("require", "exports", source)(require, exports);
    return exports;
}

const { hashCommentPassword, verifyCommentPassword } = loadTypeScript("api/_lib/commentPassword.ts");
const { parseCommentAction } = loadTypeScript("api/_lib/commentInput.ts");
const sha256 = value => createHash("sha256").update(value).digest("hex");

test("scrypt hashes are salted and verify only the right password", async () => {
    const a = await hashCommentPassword("pw-1234");
    const b = await hashCommentPassword("pw-1234");
    assert.match(a, /^scrypt\$[0-9a-f]{32}\$[0-9a-f]{64}$/);
    assert.notEqual(a, b);
    assert.equal(await verifyCommentPassword("pw-1234", a), true);
    assert.equal(await verifyCommentPassword("pw-12345", a), false);
    assert.equal(await verifyCommentPassword("", a), false);
});

test("legacy client-side hash formats still verify", async () => {
    const salt = "0123456789abcdef0123456789abcdef";
    const salted = `${salt}:${sha256(`gh-portfolio-2024-secure:${salt}:old-pw`)}`;
    assert.equal(await verifyCommentPassword("old-pw", salted), true);
    assert.equal(await verifyCommentPassword("nope", salted), false);
    assert.equal(await verifyCommentPassword("plain", sha256("plain")), true);
    assert.equal(await verifyCommentPassword("raw", "raw"), false, "plaintext legacy values are public and must not authenticate");
    assert.equal(await verifyCommentPassword("x", ""), false);
});

test("comment input parser enforces actions, lengths, and safe document ids", () => {
    const create = parseCommentAction({ action: "create", slug: "2026-01-26-ts정리", name: " 건호 ", message: " hi ", password: "pass" });
    assert.deepEqual(create, { action: "create", slug: "2026-01-26-ts정리", name: "건호", message: "hi", password: "pass" });
    assert.equal(parseCommentAction({ action: "delete", slug: "2026-01-01-a", id: "abc", password: "pw" })?.action, "delete");

    // slug 는 유효한 값으로 고정해 각 케이스가 slug 검사가 아닌 해당 필드 검사에서 거부되는지 확인
    const slug = "2026-01-01-a";
    for (const bad of [
        null,
        { action: "create", slug: "random-spam", name: "n", message: "m", password: "pass" },
        { action: "create", slug: "a/b", name: "n", message: "m", password: "pass" },
        { action: "create", slug: "..", name: "n", message: "m", password: "pass" },
        { action: "create", slug, name: "n".repeat(41), message: "m", password: "pass" },
        { action: "create", slug, name: "n", message: "m".repeat(2001), password: "pass" },
        { action: "create", slug, name: "   ", message: "m", password: "pass" },
        { action: "update", slug, id: "__x__", message: "m", password: "pw" },
        { action: "delete", slug, id: "x", password: "" },
        { action: "create", slug, name: "n", message: "m", password: "abc" },
        { action: "drop", slug, id: "x", password: "pw" },
    ]) {
        assert.equal(parseCommentAction(bad), null, JSON.stringify(bad));
    }
});

test("each rejected comment case fails on its own field, not on the slug", () => {
    const ok = { action: "create", slug: "2026-01-01-a", name: "n", message: "m", password: "pass" };
    assert.ok(parseCommentAction(ok), "baseline must pass so the invalid cases above are meaningful");
    assert.ok(parseCommentAction({ action: "update", slug: ok.slug, id: "x", message: "m", password: "pw" }));
    // 최소 길이는 새 댓글에만 — 기존 짧은 비밀번호 댓글도 수정·삭제 가능해야 함
    assert.ok(parseCommentAction({ action: "delete", slug: ok.slug, id: "x", password: "1" }));
});

const { parseBlogSlugs } = loadTypeScript("api/_lib/sitemap.ts");
const { readRequestBody, rejectCrossSite } = loadTypeScript("api/_lib/request.ts");
const { quotaDay } = loadTypeScript("api/_lib/dailyQuota.ts");

test("sitemap parser extracts decoded blog slugs only", () => {
    const xml = "<urlset><url><loc>https://x.dev/</loc></url><url><loc>https://x.dev/blog/2026-05-04-WebSocket%20%EC%A0%95%EB%A6%AC</loc></url><url><loc>https://x.dev/blog/html-a_b</loc></url><url><loc>https://x.dev/projects/hovie</loc></url><url><loc>https://x.dev/blog/bad%E0%A4%A</loc></url></urlset>";
    assert.deepEqual([...parseBlogSlugs(xml)], ["2026-05-04-WebSocket 정리", "html-a_b"]);
});

test("request body reader turns a throwing body getter or broken JSON into null", () => {
    const throwing = { get body() { throw new SyntaxError("Unexpected token"); } };
    assert.equal(readRequestBody(throwing), null);
    assert.equal(readRequestBody({ body: "{bad" }), null);
    assert.deepEqual(readRequestBody({ body: '{"a":1}' }), { a: 1 });
    assert.deepEqual(readRequestBody({ body: { a: 1 } }), { a: 1 });
});

test("cross-site guard requires JSON and a same-origin browser context", () => {
    const req = headers => ({ headers: { host: "kimgeonho.vercel.app", ...headers } });
    const json = { "content-type": "application/json; charset=utf-8" };
    assert.equal(rejectCrossSite(req({ ...json, "sec-fetch-site": "same-origin" })), null);
    assert.equal(rejectCrossSite(req({ ...json, origin: "https://kimgeonho.vercel.app" })), null);
    assert.equal(rejectCrossSite(req(json)), null, "non-browser clients without Origin are allowed");
    assert.equal(rejectCrossSite(req({ "content-type": "text/plain", "sec-fetch-site": "same-origin" })), 415);
    assert.equal(rejectCrossSite(req({})), 415);
    assert.equal(rejectCrossSite(req({ ...json, "sec-fetch-site": "cross-site" })), 403);
    assert.equal(rejectCrossSite(req({ ...json, "sec-fetch-site": "same-site" })), 403);
    assert.equal(rejectCrossSite(req({ ...json, origin: "https://evil.example" })), 403);
    assert.equal(rejectCrossSite(req({ ...json, origin: "null" })), 403);
});

test("daily quota key uses the UTC date", () => {
    assert.equal(quotaDay(new Date("2026-11-20T23:59:59Z")), "2026-11-20");
    assert.equal(quotaDay(new Date("2026-11-21T00:00:00Z")), "2026-11-21");
});

// 에뮬레이터 없이도 잡을 수 있는 규칙 회귀(PR #17 처럼 블록이 통째로 빠지는 경우) 방지
test("firestore.rules keeps every app's blocks and no catch-all allow", () => {
    // 주석 안의 예시 문구는 제외하고 실제 규칙 코드만 검사
    const rules = readFileSync("firestore.rules", "utf8").replace(/\/\/.*$/gm, "");
    for (const path of ["/blog_views/{slug}", "/blog_comments/{slug}/entries/{docId}", "/blog_comment_secrets/{slug}/entries/{docId}", "/api_usage/{docId}", "/movies/{movieId}/comments/{commentId}", "/tv/{tvId}/comments/{commentId}", "/users/{userId}/{document=**}"]) {
        assert.ok(rules.includes(`match ${path}`), path);
    }
    assert.doesNotMatch(rules, /match \/\{document=\*\*\}/, "a root catch-all match would override the explicit denies");
    assert.doesNotMatch(rules, /allow write: if request\.auth != null;/, "Hovie reviews must check ownership, not just sign-in");
    assert.equal(JSON.parse(readFileSync(".firebaserc", "utf8")).projects.default, "carrot-market-4ed07");
});

const { parseAskInput } = loadTypeScript("api/_lib/askInput.ts");
const { createRateLimiter } = loadTypeScript("api/_lib/rateLimit.ts");

test("ask input is trimmed, length-capped, and language-normalized", () => {
    assert.deepEqual(parseAskInput({ question: "  주요 프로젝트는? ", lang: "ko" }), { question: "주요 프로젝트는?", lang: "ko" });
    assert.equal(parseAskInput({ question: "hi", lang: "fr" }).lang, "ko");
    assert.equal(parseAskInput({ question: "q".repeat(301) }), null);
    assert.equal(parseAskInput({ question: "   " }), null);
    assert.equal(parseAskInput({ question: 42 }), null);
    assert.equal(parseAskInput(null), null);
});

test("ask rate limiter allows a burst per key and recovers after the window", () => {
    const allow = createRateLimiter(2, 1000);
    assert.equal(allow("a", 0), true);
    assert.equal(allow("a", 10), true);
    assert.equal(allow("a", 20), false);
    assert.equal(allow("b", 20), true);
    assert.equal(allow("a", 1500), true);
});

test("every published post slug is accepted by the comment API slug rule", () => {
    const { readdirSync } = require("node:fs");
    const slugs = [
        ...readdirSync("src/content/posts").filter(f => f.endsWith(".md")).map(f => f.replace(/\.md$/, "")),
        ...readdirSync("src/content/organizingfiles").filter(f => f.endsWith(".html")).map(f => "html-" + f.replace(/\.html$/, "").replace(/^\d{4}-\d{2}-\d{2}-/, "")),
    ];
    for (const slug of slugs) {
        assert.ok(parseCommentAction({ action: "delete", slug, id: "x", password: "pw" }), slug);
    }
});
