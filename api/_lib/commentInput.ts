// 댓글 API 입력 검증 (순수 함수 — 테스트 대상)

export const COMMENT_LIMITS = { name: 40, message: 2000, password: 100, slug: 300 } as const

export type CommentAction =
    | { action: 'create'; slug: string; name: string; message: string; password: string }
    | { action: 'update'; slug: string; id: string; message: string; password: string }
    | { action: 'delete'; slug: string; id: string; password: string }

const isText = (value: unknown, max: number): value is string =>
    typeof value === 'string' && value.trim().length > 0 && value.length <= max

// Firestore 문서 ID 제약: '/' 금지, '.', '..', '__*__' 금지
const isDocId = (value: unknown, max: number): value is string =>
    typeof value === 'string'
    && value.length > 0
    && value.length <= max
    && !value.includes('/')
    && value !== '.'
    && value !== '..'
    && !/^__.*__$/.test(value)

// 블로그 글 slug 형식: 마크다운은 'YYYY-MM-DD-제목', HTML 글은 'html-제목' — 임의 컬렉션 생성 방지
const POST_SLUG = /^(\d{4}-\d{2}-\d{2}-|html-)\S/

export function parseCommentAction(body: unknown): CommentAction | null {
    if (!body || typeof body !== 'object') return null
    const b = body as Record<string, unknown>
    if (!isDocId(b.slug, COMMENT_LIMITS.slug) || !POST_SLUG.test(b.slug)) return null
    if (typeof b.password !== 'string' || b.password.length === 0 || b.password.length > COMMENT_LIMITS.password) return null

    switch (b.action) {
        case 'create':
            if (!isText(b.name, COMMENT_LIMITS.name) || !isText(b.message, COMMENT_LIMITS.message)) return null
            return { action: 'create', slug: b.slug, name: b.name.trim(), message: b.message.trim(), password: b.password }
        case 'update':
            if (!isDocId(b.id, 100) || !isText(b.message, COMMENT_LIMITS.message)) return null
            return { action: 'update', slug: b.slug, id: b.id, message: b.message.trim(), password: b.password }
        case 'delete':
            if (!isDocId(b.id, 100)) return null
            return { action: 'delete', slug: b.slug, id: b.id, password: b.password }
        default:
            return null
    }
}
