import { db } from "../firebase/config";
import { doc, setDoc, onSnapshot, increment } from "firebase/firestore";

const COLLECTION = "blog_views";

export async function incrementViewCount(slug: string): Promise<void> {
    const ref = doc(db, COLLECTION, slug);
    await setDoc(ref, { count: increment(1) }, { merge: true });
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
