import { db } from '../firebase/config'
import {
    collection, addDoc, updateDoc, deleteDoc,
    doc, onSnapshot, query, orderBy, serverTimestamp,
} from 'firebase/firestore'

export type BlogComment = {
    id: string
    name: string
    message: string
    pwHash: string
    createdAt: { toDate: () => Date } | null
}

function entriesRef(slug: string) {
    return collection(db, 'blog_comments', slug, 'entries')
}

export function subscribeBlogComments(
    slug: string,
    callback: (comments: BlogComment[]) => void,
): () => void {
    const q = query(entriesRef(slug), orderBy('createdAt', 'desc'))
    return onSnapshot(q, (snap) => {
        const list: BlogComment[] = []
        snap.forEach((d) => {
            const data = d.data()
            list.push({
                id: d.id,
                name: data.name || '익명',
                message: data.message || '',
                pwHash: data.pwHash || '',
                createdAt: data.createdAt ?? null,
            })
        })
        callback(list)
    }, (err) => {
        console.error('[BlogComments] 구독 실패:', err)
        callback([])
    })
}

export async function addBlogComment(
    slug: string,
    data: { name: string; message: string; pwHash: string },
) {
    await addDoc(entriesRef(slug), { ...data, createdAt: serverTimestamp() })
}

export async function updateBlogComment(slug: string, commentId: string, message: string) {
    await updateDoc(doc(db, 'blog_comments', slug, 'entries', commentId), { message })
}

export async function deleteBlogComment(slug: string, commentId: string) {
    await deleteDoc(doc(db, 'blog_comments', slug, 'entries', commentId))
}
