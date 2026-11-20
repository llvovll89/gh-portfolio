// 블로그 목록용 조회수 읽기 — Firestore SDK(~450KB) 없이 공개 REST API 로 한 번만 조회
// (쓰기·실시간 구독이 필요한 글 상세는 blogViews.ts 의 SDK 경로 사용)
import { loadAllPosts } from "./loadAllPosts";
import { safeDecode } from "./safeDecode";

const PROJECT_ID = (import.meta.env.VITE_FIREBASE_PROJECT_ID as string | undefined)?.trim();
const API_KEY = (import.meta.env.VITE_FIREBASE_API_KEY as string | undefined)?.trim();
const COUNTS_TTL_MS = 60_000;

type CountField = { integerValue?: string; doubleValue?: number };
type FirestoreDoc = { name: string; fields?: { count?: CountField } };
type FirestoreListResponse = { documents?: FirestoreDoc[]; nextPageToken?: string };
type BatchGetItem = { found?: FirestoreDoc; missing?: string };

let cache: { promise: Promise<Map<string, number>>; fetchedAt: number } | null = null;

const databasePath = () => `projects/${encodeURIComponent(PROJECT_ID ?? "")}/databases/(default)/documents`;

function readCount(doc: FirestoreDoc, counts: Map<string, number>) {
    const slug = safeDecode(doc.name.split("/").pop() ?? "");
    const field = doc.fields?.count;
    const value = field?.integerValue !== undefined ? Number(field.integerValue) : field?.doubleValue;
    if (slug && typeof value === "number" && Number.isFinite(value)) counts.set(slug, value);
}

/**
 * 실제 글 slug 만 콕 집어 조회 — 컬렉션 전체를 훑지 않으므로
 * 누군가 blog_views 에 쓰레기 문서를 쌓아도 실제 글 조회수가 페이지 상한 밖으로 밀려나지 않음
 */
async function fetchKnownCounts(): Promise<Map<string, number> | null> {
    const slugs = loadAllPosts().map(post => post.slug);
    const counts = new Map<string, number>();
    if (slugs.length === 0) return counts;
    const res = await fetch(`https://firestore.googleapis.com/v1/${databasePath()}:batchGet?key=${encodeURIComponent(API_KEY ?? "")}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            documents: slugs.map(slug => `${databasePath()}/blog_views/${encodeURIComponent(slug)}`),
            mask: { fieldPaths: ["count"] },
        }),
    });
    if (!res.ok) return null;
    const items = await res.json() as BatchGetItem[];
    let found = 0;
    for (const item of items) {
        if (!item.found) continue;
        found++;
        readCount(item.found, counts);
    }
    // 문서 이름 인코딩이 맞지 않아 하나도 찾지 못한 경우를 대비해 목록 조회로 대체
    return found > 0 ? counts : null;
}

/** 대체 경로: 컬렉션 목록을 페이지 상한까지 조회 */
async function fetchListedCounts(): Promise<Map<string, number>> {
    const counts = new Map<string, number>();
    const base = `https://firestore.googleapis.com/v1/${databasePath()}/blog_views`;
    let pageToken = "";
    // 페이지 수 상한으로 무한 루프 방지
    for (let page = 0; page < 10; page++) {
        const params = new URLSearchParams({ key: API_KEY ?? "", pageSize: "300", "mask.fieldPaths": "count" });
        if (pageToken) params.set("pageToken", pageToken);
        const res = await fetch(`${base}?${params.toString()}`);
        if (!res.ok) throw new Error(`view counts ${res.status}`);
        const data = await res.json() as FirestoreListResponse;
        for (const doc of data.documents ?? []) readCount(doc, counts);
        if (!data.nextPageToken) break;
        pageToken = data.nextPageToken;
    }
    return counts;
}

async function fetchAllCounts(): Promise<Map<string, number>> {
    if (!PROJECT_ID || !API_KEY) return new Map();
    return (await fetchKnownCounts().catch(() => null)) ?? fetchListedCounts();
}

export function getListViewCount(slug: string): Promise<number> {
    if (!cache || Date.now() - cache.fetchedAt >= COUNTS_TTL_MS) {
        const promise = fetchAllCounts();
        cache = { promise, fetchedAt: Date.now() };
        // 실패한 요청은 캐시하지 않음 (그사이 교체된 새 요청의 캐시는 유지)
        promise.catch(() => { if (cache?.promise === promise) cache = null; });
    }
    return cache.promise.then(counts => counts.get(slug) ?? 0);
}

/** 글 상세에서 받은 최신 조회수를 목록 캐시에 반영 (상세 2 / 목록 1 처럼 어긋나지 않도록) */
export function primeListViewCount(slug: string, count: number): void {
    if (!cache) return;
    void cache.promise.then(counts => { counts.set(slug, count); }).catch(() => {});
}
