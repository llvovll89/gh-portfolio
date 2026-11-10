// Vercel 함수 공용 요청 헬퍼
import type { IncomingMessage } from 'node:http'

/** Vercel 이 붙여주는 x-forwarded-for 의 첫 번째 값(실제 클라이언트) 기준 IP */
export function clientIp(req: IncomingMessage): string {
    const forwarded = req.headers['x-forwarded-for']
    const first = (Array.isArray(forwarded) ? forwarded[0] : forwarded)?.split(',')[0]?.trim()
    return first || req.socket.remoteAddress || 'unknown'
}

/** 문자열 본문이면 JSON 파싱, 실패 시 null */
export function readJsonBody(body: unknown): unknown {
    if (typeof body !== 'string') return body
    try {
        return JSON.parse(body)
    } catch {
        return null
    }
}
