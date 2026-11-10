// 블로그 목록용 조회수 읽기 — Firestore SDK(~450KB) 없이 공개 REST API 로 컬렉션을 한 번만 조회
// (쓰기·실시간 구독이 필요한 글 상세는 blogViews.ts 의 SDK 경로 사용)
const PROJECT_ID = (import.meta.env.VITE_FIREBASE_PROJECT_ID as string | undefined)?.trim();
const API_KEY = (import.meta.env.VITE_FIREBASE_API_KEY as string | undefined)?.trim();
const COUNTS_TTL_MS = 60_000;

type FirestoreListResponse = {
    documents?: { name: string; fields?: { count?: { integerValue?: string; doubleValue?: number } } }[];
    nextPageToken?: string;
};

let cache: { promise: Promise<Map<string, number>>; fetchedAt: number } | null = null;

// slug 에 리터럴 '%' 가 있으면 decodeURIComponent 가 throw 하므로 원문 유지
function safeDecode(value: string): string {
    try {
        return decodeURIComponent(value);
    } catch {
        return value;
    }
}

async function fetchAllCounts(): Promise<Map<string, number>> {
    const counts = new Map<string, number>();
    if (!PROJECT_ID || !API_KEY) return counts;
    const base = `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(PROJECT_ID)}/databases/(default)/documents/blog_views`;
    let pageToken = "";
    // 페이지 수 상한으로 무한 루프 방지
    for (let page = 0; page < 10; page++) {
        const params = new URLSearchParams({ key: API_KEY, pageSize: "300", "mask.fieldPaths": "count" });
        if (pageToken) params.set("pageToken", pageToken);
        const res = await fetch(`${base}?${params.toString()}`);
        if (!res.ok) throw new Error(`view counts ${res.status}`);
        const data = await res.json() as FirestoreListResponse;
        for (const doc of data.documents ?? []) {
            const slug = safeDecode(doc.name.split("/").pop() ?? "");
            const field = doc.fields?.count;
            const value = field?.integerValue !== undefined ? Number(field.integerValue) : field?.doubleValue;
            if (slug && typeof value === "number" && Number.isFinite(value)) counts.set(slug, value);
        }
        if (!data.nextPageToken) break;
        pageToken = data.nextPageToken;
    }
    return counts;
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
