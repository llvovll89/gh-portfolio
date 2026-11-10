import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { resolve } from "node:path";
import { test } from "node:test";
import assert from "node:assert/strict";
import ts from "typescript";

const require = createRequire(import.meta.url);
const cache = new Map();
function loadTypeScript(file) {
    const absolute = resolve(file);
    if (cache.has(absolute)) return cache.get(absolute);
    const source = ts.transpileModule(readFileSync(absolute, "utf8"), {
        compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
    }).outputText;
    const exports = {};
    cache.set(absolute, exports);
    const localRequire = name => name.startsWith(".")
        ? loadTypeScript(resolve(absolute, "..", name + ".ts")) : require(name);
    new Function("require", "exports", source)(localRequire, exports);
    return exports;
}

const { parseToc, slugifyHeading } = loadTypeScript("src/utils/parseToc.ts");
const { sortPosts, filterPosts, extractAllCategories, getTagCounts } = loadTypeScript("src/utils/blogFilters.ts");
const { getCliSuggestions, runCliCommand } = loadTypeScript("src/utils/runCliCommand.ts");
const { parseMarkdownPost } = loadTypeScript("src/utils/postMetadata.ts");

test("TOC ignores headings inside fenced code blocks and numbers duplicates like the renderer", () => {
    const md = [
        "## 설치",
        "```bash",
        "## 이건 주석",
        "```",
        "### 옵션",
        "~~~~",
        "### 가짜",
        "```",
        "~~~~",
        "## 설치",
    ].join("\n");
    assert.deepEqual(parseToc(md), [
        { id: "설치", text: "설치", level: 2 },
        { id: "옵션", text: "옵션", level: 3 },
        { id: "설치-2", text: "설치", level: 2 },
    ]);
    assert.equal(slugifyHeading("  React 19 — 새 훅!  "), "react-19-새-훅");
});

test("every post's TOC ids are unique", () => {
    for (const file of require("node:fs").readdirSync("src/content/posts")) {
        const raw = readFileSync("src/content/posts/" + file, "utf8").replace(/\r\n/g, "\n");
        const ids = parseToc(raw).map(item => item.id);
        assert.equal(new Set(ids).size, ids.length, file);
    }
});

const posts = [
    { slug: "a", title: "React 훅", date: "2026-01-02", tags: ["react", "hooks"], category: "Frontend", body: "", readingTime: "" },
    { slug: "b", title: "Spring JPA", date: "2026-03-01", tags: ["spring"], category: "Backend", body: "", readingTime: "" },
    { slug: "c", title: "React 19", date: "2026-02-01", tags: ["react"], category: "Frontend", body: "", readingTime: "" },
];

test("blog filters sort by date, filter by category and AND-ed tags", () => {
    assert.deepEqual(sortPosts(posts, "desc").map(p => p.slug), ["b", "c", "a"]);
    assert.deepEqual(sortPosts(posts, "asc").map(p => p.slug), ["a", "c", "b"]);
    assert.deepEqual(filterPosts(posts, "", [], "Frontend").map(p => p.slug), ["a", "c"]);
    assert.deepEqual(filterPosts(posts, "", ["react", "hooks"], "").map(p => p.slug), ["a"]);
    assert.deepEqual(extractAllCategories(posts), ["Backend", "Frontend"]);
    assert.equal(getTagCounts(posts).react, 2);
});

test("CLI suggests commands including ask and handles unknown input", () => {
    assert.ok(getCliSuggestions("a").includes("ask"));
    assert.deepEqual(getCliSuggestions("git st"), ["git status"]);
    assert.match(runCliCommand("help"), /ask <질문>/);
    assert.equal(runCliCommand("   "), "");
});

test("frontmatter category and featured flags are parsed", () => {
    const post = parseMarkdownPost("x/2026-01-01-sample.md", "---\ntitle: Sample\ndate: 2026-01-01\ncategory: Notes\nfeatured: true\n---\nbody");
    assert.equal(post.category, "Notes");
    assert.equal(post.featured, true);
    assert.equal(parseMarkdownPost("y.md", "---\ntitle: T\n---\nb").featured, undefined);
});
