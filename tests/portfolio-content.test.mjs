import { readFileSync, readdirSync } from "node:fs";
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
    const localRequire = name => name.startsWith(".")
        ? loadTypeScript(resolve(absolute, "..", name + ".ts")) : require(name);
    new Function("require", "exports", source)(localRequire, exports);
    cache.set(absolute, exports);
    return exports;
}

const { blogContent } = loadTypeScript("build/blogContent.ts");
const { parseMarkdownPost, parseHtmlPost } = loadTypeScript("src/utils/postMetadata.ts");
const { projects } = loadTypeScript("src/pages/projects/mocks/projectData.ts");

function readGenerated(plugin, filename, query) {
    const code = plugin.load.call({ addWatchFile() {} }, resolve(filename) + "?" + query);
    return JSON.parse(code.replace(/^export default /, ""));
}

test("all published articles retain metadata and searchable content without shipping bodies in listings", () => {
    const plugin = blogContent();
    const slugs = new Set();
    for (const [dir, ext, parse] of [
        ["src/content/posts", ".md", parseMarkdownPost],
        ["src/content/organizingfiles", ".html", parseHtmlPost],
    ]) {
        for (const file of readdirSync(dir).filter(file => file.endsWith(ext))) {
            const path = dir + "/" + file;
            const post = parse(path, readFileSync(path, "utf8"));
            const metadata = readGenerated(plugin, path, "post-meta");
            const searchable = readGenerated(plugin, path, "post-search");
            assert.ok(!slugs.has(post.slug), "duplicate article slug: " + post.slug);
            slugs.add(post.slug);
            assert.ok(post.title && post.body && post.summary, path);
            assert.equal(metadata.body, "", path);
            assert.equal(metadata.title, post.title, path);
            assert.equal(metadata.readingTime, post.readingTime, path);
            assert.equal(searchable.body, post.body, path);
            assert.equal(searchable.slug, metadata.slug, path);
        }
    }
    assert.ok(slugs.size > 60);
});

test("missing summaries become short plain text, including HTML documents with metadata in either order", () => {
    const md = parseMarkdownPost("2026-01-01-example.md", "---\ntitle: Example\ndate: 2026-01-01\n---\n# Heading\n**Useful** [link](https://example.com) " + "content ".repeat(100));
    assert.ok(md.summary.length <= 160);
    assert.ok(!md.summary.includes("**") && !md.summary.includes("https://"));
    const html = parseHtmlPost("2026-01-01-example.html", '<title>Example</title><meta content="Short summary" name="description"><meta name="keywords" content="web, html"><script>ignore this</script><p>Useful content</p>');
    assert.equal(html.slug, "html-example");
    assert.equal(html.summary, "Short summary");
    assert.deepEqual(html.tags, ["web", "html"]);
});

test("all project URLs are unique and every displayed project field is available in all three languages", () => {
    const slugs = projects.map(project => project.slug);
    assert.equal(new Set(slugs).size, projects.length);
    for (const language of ["ko", "en", "ja"]) {
        const locale = JSON.parse(readFileSync("src/i18n/locales/" + language + ".json", "utf8"));
        assert.ok(locale.routes.home && !locale.routes.home.includes("?"));
        for (const project of projects) {
            assert.match(project.slug, /^[a-z0-9]+(?:-[a-z0-9]+)*$/);
            const content = locale.projectContent[project.slug];
            for (const field of ["scale", "description", "detailedDescription", "role", "challenge", "contributions", "outcome", "projectMembers"]) {
                if (project[field] !== undefined) {
                    assert.ok(content[field], language + ": " + project.slug + "." + field);
                    assert.ok(!String(content[field]).includes("??"), "encoding: " + language + ": " + project.slug + "." + field);
                    if (language !== "ko") assert.ok(!/[가-힣]/.test(String(content[field])), "untranslated: " + language + ": " + project.slug + "." + field);
                }
            }
        }
    }
});
