import { db } from "../firebase/config";
import { doc, setDoc, onSnapshot, increment } from "firebase/firestore";
import { logger } from "./logger";

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
    const ref = doc(db, COLLECTION, slug);
    await setDoc(ref, { count: increment(1) }, { merge: true });
    // 쓰기 성공 후에만 기록 — 실패(오프라인 등) 시 같은 세션에서 다시 시도할 수 있게 함
    markViewedInSession(slug);
}

export function subscribeViewCount(
    slug: string,
    callback: (count: number) => void
): () => void {
    if (!db) return () => {};
    const ref = doc(db, COLLECTION, slug);
    return onSnapshot(
        ref,
        (snap) => {
            const count: unknown = snap.exists() ? (snap.data() as { count?: unknown }).count : 0;
            callback(typeof count === "number" ? count : 0);
        },
        // 권한·네트워크 오류 시 조회수만 숨기고 콘솔 미처리 오류로 남기지 않음
        (error) => logger.warn("조회수 구독 실패", error),
    );
}
