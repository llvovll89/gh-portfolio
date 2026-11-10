import { db } from "../firebase/config";
import { collection, doc, setDoc, getDocs, onSnapshot, increment } from "firebase/firestore";

const COLLECTION = "blog_views";
const SESSION_KEY = "viewed_posts";

function hasViewedInSession(slug: string): boolean {
    try {
        const raw = sessionStorage.getItem(SESSION_KEY);
        const viewed = (raw ? JSON.parse(raw) : []) as string[];
        return viewed.includes(slug);
    } catch {
        return false;
    }
}

function markViewedInSession(slug: string): void {
    try {
        const raw = sessionStorage.getItem(SESSION_KEY);
        const viewed = (raw ? JSON.parse(raw) : []) as string[];
        if (!viewed.includes(slug)) {
            viewed.push(slug);
            sessionStorage.setItem(SESSION_KEY, JSON.stringify(viewed));
        }
    } catch {
        // sessionStorage 접근 불가 시 무시
    }
}

export async function incrementViewCount(slug: string): Promise<void> {
    if (hasViewedInSession(slug)) return;
    if (!db) return;
    markViewedInSession(slug);
    const ref = doc(db, COLLECTION, slug);
    await setDoc(ref, { count: increment(1) }, { merge: true });
}

// 목록 카드마다 getDoc 을 보내던 N+1 대신, 컬렉션을 한 번만 읽어 짧게 캐시
const COUNTS_TTL_MS = 60_000;
let countsCache: { promise: Promise<Map<string, number>>; fetchedAt: number } | null = null;

function loadAllViewCounts(): Promise<Map<string, number>> {
    if (countsCache && Date.now() - countsCache.fetchedAt < COUNTS_TTL_MS) return countsCache.promise;
    if (!db) return Promise.resolve(new Map<string, number>());
    const promise = getDocs(collection(db, COLLECTION)).then((snap) => {
        const counts = new Map<string, number>();
        snap.forEach((d) => {
            const count = (d.data() as { count?: unknown }).count;
            if (typeof count === "number") counts.set(d.id, count);
        });
        return counts;
    });
    countsCache = { promise, fetchedAt: Date.now() };
    // 실패한 요청은 캐시하지 않음
    promise.catch(() => { countsCache = null; });
    return promise;
}

export async function getViewCount(slug: string): Promise<number> {
    return (await loadAllViewCounts()).get(slug) ?? 0;
}

export function subscribeViewCount(
    slug: string,
    callback: (count: number) => void
): () => void {
    if (!db) return () => {};
    const ref = doc(db, COLLECTION, slug);
    return onSnapshot(ref, (snap) => {
        callback(snap.exists() ? (snap.data().count as number) ?? 0 : 0);
    });
}
