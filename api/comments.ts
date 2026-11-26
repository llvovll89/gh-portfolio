import { FieldValue } from 'firebase-admin/firestore'
import { parseCommentAction } from './_lib/commentInput.js'
import { hashCommentPassword, verifyCommentPassword } from './_lib/commentPassword.js'
import { getAdminDb } from './_lib/firebaseAdmin.js'
import { createRateLimiter } from './_lib/rateLimit.js'
import { isKnownPostSlug } from './_lib/postSlugs.js'
import { clientIp, readRequestBody, rejectCrossSite, type ApiRequest, type ApiResponse } from './_lib/request.js'

const WRONG_PASSWORD_DELAY_MS = 400
// IP당 10분에 20회 (생성·수정·삭제 합산) — 스팸·비밀번호 대입 완화
const allow = createRateLimiter(20, 10 * 60 * 1000)

/**
 * 댓글 생성/수정/삭제 — 비밀번호 해시는 공개 문서가 아닌
 * blog_comment_secrets/{slug}/entries/{id} 에 저장하고 클라이언트 접근은 규칙으로 차단
 */
export default async function handler(req: ApiRequest, res: ApiResponse) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST')
        return res.status(405).json({ error: 'method-not-allowed' })
    }
    const crossSite = rejectCrossSite(req)
    if (crossSite) return res.status(crossSite).json({ error: crossSite === 415 ? 'unsupported-media-type' : 'forbidden' })

    const input = parseCommentAction(readRequestBody(req))
    if (!input) return res.status(400).json({ error: 'invalid-input' })
    if (!allow(clientIp(req))) return res.status(429).json({ error: 'rate-limited' })
    // 형식만 맞는 가짜 slug 로 컬렉션이 생기지 않도록 실제 배포된 글인지 확인 (확인 불가(null)면 형식 검증만으로 허용)
    if (input.action === 'create' && (await isKnownPostSlug(input.slug)) === false) {
        return res.status(404).json({ error: 'not-found' })
    }

    const db = getAdminDb()
    if (!db) return res.status(503).json({ error: 'not-configured' })

    const commentRef = (id: string) => db.collection('blog_comments').doc(input.slug).collection('entries').doc(id)
    const secretRef = (id: string) => db.collection('blog_comment_secrets').doc(input.slug).collection('entries').doc(id)

    try {
        if (input.action === 'create') {
            const ref = db.collection('blog_comments').doc(input.slug).collection('entries').doc()
            const pwHash = await hashCommentPassword(input.password)
            const batch = db.batch()
            batch.set(ref, { name: input.name, message: input.message, createdAt: FieldValue.serverTimestamp() })
            batch.set(secretRef(ref.id), { pwHash })
            await batch.commit()
            return res.status(201).json({ id: ref.id })
        }

        const [commentSnap, secretSnap] = await Promise.all([commentRef(input.id).get(), secretRef(input.id).get()])
        if (!commentSnap.exists) return res.status(404).json({ error: 'not-found' })

        // 레거시 댓글은 공개 문서에 pwHash 가 남아 있음
        const legacyHash = commentSnap.get('pwHash') as string | undefined
        const storedHash = (secretSnap.get('pwHash') as string | undefined) ?? legacyHash ?? ''

        if (!(await verifyCommentPassword(input.password, storedHash))) {
            await new Promise((resolve) => setTimeout(resolve, WRONG_PASSWORD_DELAY_MS))
            return res.status(403).json({ error: 'wrong-password' })
        }

        const batch = db.batch()
        if (input.action === 'delete') {
            batch.delete(commentRef(input.id))
            batch.delete(secretRef(input.id))
        } else {
            batch.update(commentRef(input.id), {
                message: input.message,
                ...(legacyHash ? { pwHash: FieldValue.delete() } : {}),
            })
            // 레거시 해시는 수정 시점에 scrypt 로 이관
            if (!storedHash.startsWith('scrypt$')) {
                batch.set(secretRef(input.id), { pwHash: await hashCommentPassword(input.password) })
            }
        }
        await batch.commit()
        return res.status(200).json({ ok: true })
    } catch (err) {
        console.error('[api/comments]', err)
        return res.status(500).json({ error: 'server-error' })
    }
}
