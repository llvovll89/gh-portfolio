import { db } from '../firebase/config'
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore'

export type BlogComment = {
    id: string
    name: string
    message: string
    createdAt: { toDate: () => Date } | null
}

export type CommentErrorCode = 'invalid-input' | 'wrong-password' | 'not-found' | 'not-configured' | 'rate-limited' | 'server-error'

export class CommentRequestError extends Error {
    readonly code: CommentErrorCode

    constructor(code: CommentErrorCode) {
        super(code)
        this.code = code
    }
}

export function subscribeBlogComments(
    slug: string,
    callback: (comments: BlogComment[]) => void,
    onError?: () => void,
): () => void {
    // Firebase 미설정 환경: 기존 로드 실패 UI 로 안내
    if (!db) {
        queueMicrotask(() => onError?.())
        return () => {}
    }
    const q = query(collection(db, 'blog_comments', slug, 'entries'), orderBy('createdAt', 'desc'))
    return onSnapshot(q, (snap) => {
        const list: BlogComment[] = []
        snap.forEach((d) => {
            const data = d.data() as Partial<Omit<BlogComment, 'id'>>
            list.push({
                id: d.id,
                name: data.name || '익명',
                message: data.message || '',
                createdAt: data.createdAt ?? null,
            })
        })
        callback(list)
    }, (err) => {
        console.error('[BlogComments] 구독 실패:', err)
        onError?.()
    })
}

// 쓰기는 서버(/api/comments)에서 비밀번호를 검증한 뒤 Admin SDK로 처리
async function requestComment(body: Record<string, string>): Promise<void> {
    let res: Response
    try {
        res = await fetch('/api/comments', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        })
    } catch {
        throw new CommentRequestError('server-error')
    }
    if (res.ok) return
    const data = await res.json().catch(() => null) as { error?: CommentErrorCode } | null
    throw new CommentRequestError(data?.error ?? 'server-error')
}

export function addBlogComment(slug: string, data: { name: string; message: string; password: string }) {
    return requestComment({ action: 'create', slug, ...data })
}

export function updateBlogComment(slug: string, commentId: string, message: string, password: string) {
    return requestComment({ action: 'update', slug, id: commentId, message, password })
}

export function deleteBlogComment(slug: string, commentId: string, password: string) {
    return requestComment({ action: 'delete', slug, id: commentId, password })
}
