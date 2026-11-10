import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { test } from "node:test";
import assert from "node:assert/strict";
import ts from "typescript";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

function loadTypeScript(file) {
    const source = ts.transpileModule(readFileSync(resolve(file), "utf8"), {
        compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
    }).outputText;
    const exports = {};
    new Function("require", "exports", source)(require, exports);
    return exports;
}

const guard = loadTypeScript("api/_lib/githubGuard.ts");
const OWNER = "kimgeonho";

test("github path guard allows only the configured owner's known endpoints", () => {
    assert.equal(guard.validateGithubPath("/repos/kimgeonho/gh-portfolio", OWNER), "/repos/kimgeonho/gh-portfolio");
    assert.equal(guard.validateGithubPath("/repos/KimGeonHo/gh-portfolio/commits", OWNER), "/repos/KimGeonHo/gh-portfolio/commits");
    assert.equal(guard.validateGithubPath("/users/kimgeonho/events", OWNER), "/users/kimgeonho/events");

    for (const bad of [
        "/repos/../user/issues",
        "/repos/kimgeonho/../../user",
        "/repos/kimgeonho/./issues",
        "/repos/%2e%2e/user",
        "/repos/someone-else/repo",
        "/users/someone-else/events",
        "/repos/kimgeonho/repo/collaborators",
        "/user",
        "repos/kimgeonho/repo",
        "/repos/kimgeonho/repo?x=1",
        undefined,
    ]) {
        assert.equal(guard.validateGithubPath(bad, OWNER), null, String(bad));
    }
});

test("github params guard drops unknown keys and out-of-range values", () => {
    const params = guard.pickGithubParams([
        ["per_page", "20"], ["state", "all"], ["sha", "main"], ["access_token", "x"], ["page", "0"],
    ]);
    assert.equal(params.toString(), "per_page=20&state=all&sha=main");
    assert.equal(guard.pickGithubParams([["per_page", "1000"], ["sha", "../x"]]).toString(), "");
});

test("contributions guard pins login and caps the range at one year", () => {
    const to = new Date("2026-11-10T00:00:00Z");
    const from = new Date("2025-11-10T00:00:00Z");
    assert.deepEqual(
        guard.validateContributionsInput({ login: OWNER, from: from.toISOString(), to: to.toISOString() }, OWNER),
        { login: OWNER, from: from.toISOString(), to: to.toISOString() },
    );
    assert.equal(guard.validateContributionsInput({ login: "other", from: from.toISOString(), to: to.toISOString() }, OWNER), null);
    assert.equal(guard.validateContributionsInput({ login: OWNER, from: "2020-01-01", to: to.toISOString() }, OWNER), null);
    assert.equal(guard.validateContributionsInput({ login: OWNER, from: "nope", to: to.toISOString() }, OWNER), null);
    assert.equal(guard.validateContributionsInput({ login: OWNER, from: to.toISOString(), to: from.toISOString() }, OWNER), null);
});
