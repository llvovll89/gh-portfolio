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
        compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
    }).outputText;
    const exports = {};
    const localRequire = name => name.startsWith(".")
        ? loadTypeScript(resolve(absolute, "..", `${name}.ts`))
        : require(name);
    new Function("require", "exports", source)(localRequire, exports);
    cache.set(absolute, exports);
    return exports;
}

const { ThemeMode } = loadTypeScript("src/context/constatns/Theme.type.ts");
const { getThemePalette, contrast } = loadTypeScript("src/utils/themePalette.ts");
const { buildContactMailto } = loadTypeScript("src/utils/contactMailto.ts");

function assertReadable(palette, label) {
    const values = palette.variables;
    for (const surface of ["--surface", "--surface-panel", "--surface-inset"]) {
        for (const text of ["--text-primary", "--text-muted", "--accent", "--error", "--success"]) {
            assert.ok(contrast(values[surface], values[text]) >= 4.5, `${label}: ${text} on ${surface}`);
        }
        assert.ok(contrast(values[surface], values["--input-line"]) >= 3, `${label}: input boundary`);
    }
    assert.ok(contrast(values["--accent"], values["--on-accent"]) >= 4.5, `${label}: button label`);
}

test("all presets have readable text, focus colors, and button labels", () => {
    for (const mode of Object.values(ThemeMode)) assertReadable(getThemePalette(mode), mode);
});

test("custom hues remain readable across dark, bright, and borderline RGB backgrounds", () => {
    assert.equal(getThemePalette(ThemeMode.CUSTOM, "#ffffff").variables["--surface"], "#ffffff");
    assert.equal(getThemePalette(ThemeMode.CUSTOM, "#ffffff").dark, false);
    assert.equal(getThemePalette(ThemeMode.CUSTOM, "#000000").variables["--surface"], "#000000");
    for (let red = 0; red <= 255; red += 17) {
        for (let green = 0; green <= 255; green += 17) {
            for (let blue = 0; blue <= 255; blue += 17) {
                const hex = `#${[red, green, blue].map(value => value.toString(16).padStart(2, "0")).join("")}`;
                assertReadable(getThemePalette(ThemeMode.CUSTOM, hex), hex);
            }
        }
    }
});

test("system mode follows the OS and malformed custom colors fall back safely", () => {
    assert.equal(getThemePalette(ThemeMode.SYSTEM, undefined, true).dark, true);
    assert.equal(getThemePalette(ThemeMode.SYSTEM, undefined, false).dark, false);
    for (const color of [undefined, "", "#xyzxyz", "#fff", "red"]) assertReadable(getThemePalette(ThemeMode.CUSTOM, color), String(color));
});

test("mail app fallback preserves Unicode, newlines, and reserved URL characters", () => {
    const subject = "김건호님 문의 & collaboration\r\nReply";
    const body = "안녕하세요?\nReact + TypeScript #1 & 100%\nreply@example.com";
    const mailto = new URL(buildContactMailto("svvvs5579@naver.com", subject, body));
    assert.equal(mailto.protocol, "mailto:");
    assert.equal(mailto.pathname, "svvvs5579@naver.com");
    assert.equal(mailto.searchParams.get("subject"), "김건호님 문의 & collaboration Reply");
    assert.equal(mailto.searchParams.get("body"), body);
    assert.deepEqual([...mailto.searchParams.keys()], ["subject", "body"]);
});
