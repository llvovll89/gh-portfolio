import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { dirname, resolve } from "node:path";
import { createRequire } from "node:module";
import { test } from "node:test";
import assert from "node:assert/strict";
import ts from "typescript";

const require = createRequire(import.meta.url);

/** api/*.ts 를 CommonJS 로 트랜스파일해 로드 — `./_lib/x.js` 는 같은 이름의 .ts 로, overrides 에 있는 모듈은 mock 으로 대체 */
function loadHandler(file, overrides) {
    const cache = new Map();
    const load = absolute => {
        if (cache.has(absolute)) return cache.get(absolute);
        const source = ts.transpileModule(readFileSync(absolute, "utf8"), {
            compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
        }).outputText;
        const module = { exports: {} };
        cache.set(absolute, module.exports);
        const localRequire = name => {
            if (overrides[name]) return overrides[name];
            if (name.startsWith(".")) return load(resolve(dirname(absolute), name.replace(/\.js$/, ".ts")));
            return require(name);
        };
        new Function("require", "exports", "module", source)(localRequire, module.exports, module);
        return module.exports;
    };
    return load(resolve(file)).default;
}

/** 경로 문자열을 키로 쓰는 최소 Firestore 대역 (collection/doc/get/batch 만) */
function fakeDb(initial = {}) {
    const docs = new Map(Object.entries(initial));
    let autoId = 0;
    const docRef = path => ({
        id: path.split("/").pop(),
        path,
        collection: name => ({ doc: id => docRef(`${path}/${name}/${id ?? "auto" + ++autoId}`) }),
        get: async () => {
            const data = docs.get(path);
            return { exists: data !== undefined, get: field => data?.[field] };
        },
    });
    return {
        docs,
        collection: name => ({ doc: id => docRef(`${name}/${id ?? "auto" + ++autoId}`) }),
        batch() {
            const ops = [];
            return {
                set: (ref, data) => ops.push(() => docs.set(ref.path, { ...data })),
                update: (ref, data) => ops.push(() => {
                    const next = { ...docs.get(ref.path), ...data };
                    for (const [key, value] of Object.entries(next)) if (value === DELETE) delete next[key];
                    docs.set(ref.path, next);
                }),
                delete: ref => ops.push(() => docs.delete(ref.path)),
                commit: async () => ops.forEach(op => op()),
            };
        },
    };
}

const DELETE = Symbol("delete");
const fieldValue = { FieldValue: { serverTimestamp: () => "SERVER_TS", delete: () => DELETE } };

function call(handler, { body, headers = {}, method = "POST" }) {
    const req = {
        method,
        headers: { "content-type": "application/json", "sec-fetch-site": "same-origin", host: "kimgeonho.vercel.app", ...headers },
        body,
        query: {},
        socket: { remoteAddress: "127.0.0.1" },
    };
    return new Promise(done => {
        const res = {
            statusCode: 200,
            setHeader() {},
            status(code) { this.statusCode = code; return this; },
            json(data) { done({ status: this.statusCode, data }); },
        };
        void handler(req, res);
    });
}

const SLUG = "2026-01-01-sample";
const commentPath = id => `blog_comments/${SLUG}/entries/${id}`;
const secretPath = id => `blog_comment_secrets/${SLUG}/entries/${id}`;

function commentsHandler(db) {
    return loadHandler("api/comments.ts", {
        "./_lib/firebaseAdmin.js": { getAdminDb: () => db },
        "./_lib/postSlugs.js": { isKnownPostSlug: async slug => slug === SLUG },
        "firebase-admin/firestore": fieldValue,
    });
}

test("comments: create stores the hash only in the private secrets collection", async () => {
    const db = fakeDb();
    const res = await call(commentsHandler(db), { body: { action: "create", slug: SLUG, name: "건호", message: "hi", password: "pass1" } });
    assert.equal(res.status, 201);
    const comment = db.docs.get(commentPath(res.data.id));
    assert.deepEqual(comment, { name: "건호", message: "hi", createdAt: "SERVER_TS" });
    assert.match(db.docs.get(secretPath(res.data.id)).pwHash, /^scrypt\$/);
});

test("comments: rejects cross-site and non-JSON requests before touching the database", async () => {
    const db = fakeDb();
    const body = { action: "create", slug: SLUG, name: "n", message: "m", password: "pass1" };
    assert.equal((await call(commentsHandler(db), { body, headers: { "content-type": "text/plain" } })).status, 415);
    assert.equal((await call(commentsHandler(db), { body, headers: { "sec-fetch-site": "cross-site" } })).status, 403);
    assert.equal((await call(commentsHandler(db), { body: { ...body, slug: "2026-01-01-unknown" } })).status, 404);
    assert.equal(db.docs.size, 0);
});

test("comments: wrong password is refused, right password deletes both documents", async () => {
    const db = fakeDb();
    const handler = commentsHandler(db);
    const { data } = await call(handler, { body: { action: "create", slug: SLUG, name: "n", message: "m", password: "pass1" } });
    assert.equal((await call(handler, { body: { action: "delete", slug: SLUG, id: data.id, password: "nope" } })).status, 403);
    assert.ok(db.docs.has(commentPath(data.id)));
    assert.equal((await call(handler, { body: { action: "delete", slug: SLUG, id: data.id, password: "pass1" } })).status, 200);
    assert.equal(db.docs.has(commentPath(data.id)) || db.docs.has(secretPath(data.id)), false);
});

test("comments: editing a legacy comment migrates its public hash to a private scrypt hash", async () => {
    const legacy = createHash("sha256").update("old").digest("hex");
    const db = fakeDb({ [commentPath("legacy")]: { name: "n", message: "before", pwHash: legacy } });
    const res = await call(commentsHandler(db), { body: { action: "update", slug: SLUG, id: "legacy", message: "after", password: "old" } });
    assert.equal(res.status, 200);
    assert.deepEqual(db.docs.get(commentPath("legacy")), { name: "n", message: "after" }, "public pwHash must be removed");
    assert.match(db.docs.get(secretPath("legacy")).pwHash, /^scrypt\$/);
});
