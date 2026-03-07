import { db } from "../firebase/config";
import { doc, setDoc, getDoc, onSnapshot, increment } from "firebase/firestore";

const COLLECTION = "blog_views";
const SESSION_KEY = "viewed_posts";

function hasViewedInSession(slug: string): boolean {
    try {
        const raw = sessionStorage.getItem(SESSION_KEY);
        const viewed: string[] = raw ? JSON.parse(raw) : [];
        return viewed.includes(slug);
    } catch {
        return false;
    }
}

function markViewedInSession(slug: string): void {
    try {
        const raw = sessionStorage.getItem(SESSION_KEY);
        const viewed: string[] = raw ? JSON.parse(raw) : [];
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
    markViewedInSession(slug);
    const ref = doc(db, COLLECTION, slug);
    await setDoc(ref, { count: increment(1) }, { merge: true });
}

export async function getViewCount(slug: string): Promise<number> {
    const ref = doc(db, COLLECTION, slug);
    const snap = await getDoc(ref);
    return snap.exists() ? (snap.data().count as number) ?? 0 : 0;
}

export function subscribeViewCount(
    slug: string,
    callback: (count: number) => void
): () => void {
    const ref = doc(db, COLLECTION, slug);
    return onSnapshot(ref, (snap) => {
        callback(snap.exists() ? (snap.data().count as number) ?? 0 : 0);
    });
}
