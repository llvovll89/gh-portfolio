import { db } from "../firebase/config";
import { doc, setDoc, getDoc, onSnapshot, increment } from "firebase/firestore";

const COLLECTION = "blog_views";

export async function incrementViewCount(slug: string): Promise<void> {
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
