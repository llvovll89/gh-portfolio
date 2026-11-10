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
    const create = parseCommentAction({ action: "create", slug: "2026-01-26-ts정리", name: " 건호 ", message: " hi ", password: "pw" });
    assert.deepEqual(create, { action: "create", slug: "2026-01-26-ts정리", name: "건호", message: "hi", password: "pw" });
    assert.equal(parseCommentAction({ action: "delete", slug: "2026-01-01-a", id: "abc", password: "pw" })?.action, "delete");

    for (const bad of [
        null,
        { action: "create", slug: "random-spam", name: "n", message: "m", password: "pw" },
        { action: "create", slug: "a/b", name: "n", message: "m", password: "pw" },
        { action: "create", slug: "..", name: "n", message: "m", password: "pw" },
        { action: "create", slug: "a", name: "n".repeat(41), message: "m", password: "pw" },
        { action: "create", slug: "a", name: "n", message: "m".repeat(2001), password: "pw" },
        { action: "create", slug: "a", name: "   ", message: "m", password: "pw" },
        { action: "update", slug: "a", id: "__x__", message: "m", password: "pw" },
        { action: "delete", slug: "a", id: "x", password: "" },
        { action: "drop", slug: "a", id: "x", password: "pw" },
    ]) {
        assert.equal(parseCommentAction(bad), null, JSON.stringify(bad));
    }
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
