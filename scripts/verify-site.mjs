import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";
import sharp from "sharp";

const root = "https://kimgeonho.vercel.app";
const xml = fs.readFileSync("dist/sitemap.xml", "utf8");
const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => match[1].replace(/&amp;/g, "&"));
assert.equal(new Set(urls).size, urls.length, "duplicate sitemap URLs");
assert.ok(urls.length > 75, "missing published pages");
for (const url of urls) {
    const pathname = decodeURIComponent(new URL(url).pathname);
    const file = path.join("dist", pathname, "index.html");
    const html = fs.readFileSync(file, "utf8");
    assert.ok(html.includes('<link rel="canonical" href="' + url + '">'), url + ": canonical");
    assert.ok(html.includes('property="og:url" content="' + url + '"'), url + ": OG URL");
    assert.match(html, /<meta name="description" content="[^"]+"/, url + ": description");
    assert.match(html, /<h1[^>]*>[^<]+/, url + ": visible static heading");
    assert.ok(html.includes('id="seo-content"'), url + ": static content");
    const schema = JSON.parse(html.match(/<script id="seo-schema" type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
    assert.equal(schema["@context"], "https://schema.org");
    if (pathname.startsWith("/blog/")) {
        const article = schema["@graph"].find(item => item["@type"] === "BlogPosting");
        assert.ok(article?.headline && article.author && article.mainEntityOfPage === url, url + ": article schema");
    }
}
assert.match(fs.readFileSync("dist/robots.txt", "utf8"), /Sitemap: https:\/\/kimgeonho\.vercel\.app\/sitemap\.xml/);
assert.ok(fs.readFileSync("dist/404.html", "utf8").includes('content="noindex, follow"'));
const vercel = JSON.parse(fs.readFileSync("vercel.json", "utf8"));
assert.equal(vercel.cleanUrls, true);
assert.ok(!vercel.rewrites?.some(rule => rule.destination === "/"), "unknown URLs must not become soft 404s");
const sw = fs.readFileSync("dist/sw.js", "utf8");
assert.ok(!sw.includes('url:"assets/post-body-') && !sw.includes('url:"assets/searchPosts-'), "on-demand article payloads must not be precached");
const images = JSON.parse(fs.readFileSync("src/generated/images.json", "utf8"));
let originalBytes = 0, optimizedBytes = 0;
for (const [source, image] of Object.entries(images)) {
    const metadata = await sharp("public" + image.src).metadata();
    assert.equal(metadata.format, "webp", source);
    assert.ok(Math.abs(metadata.width / metadata.height - image.width / image.height) < .01, source + ": aspect ratio");
    for (const candidate of image.srcSet.split(", ")) assert.ok(fs.existsSync("public" + candidate.split(" ")[0]), source + ": srcset");
    originalBytes += fs.statSync("public" + source).size;
    optimizedBytes += fs.statSync("public" + image.src).size;
}
assert.ok(optimizedBytes < originalBytes * .3, "image budget");
const cssFiles = fs.readdirSync("dist/assets").filter(file => file.endsWith(".css"));
const css = cssFiles.map(file => fs.readFileSync("dist/assets/" + file, "utf8")).join("\n");
assert.ok(css.includes('unicode-range:') && css.includes('Pretendard Variable'), "self-hosted font subsets");
console.log(JSON.stringify({ pages: urls.length, images: Object.keys(images).length, originalImageBytes: originalBytes, optimizedImageBytes: optimizedBytes, seo: "passed", fontSubsets: "passed" }));
