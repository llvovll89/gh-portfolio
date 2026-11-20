// Vercel 함수 공용 요청 헬퍼
import type { IncomingMessage, ServerResponse } from 'node:http'

/** Vercel Node 런타임이 붙여 주는 body·query 를 포함한 요청 */
export type ApiRequest = IncomingMessage & { body?: unknown; query: Record<string, string | string[]> }

/** Vercel Node 런타임의 응답 헬퍼 (status·json) */
export type ApiResponse = ServerResponse & {
    status: (code: number) => ApiResponse
    json: (data: unknown) => void
}

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

/**
 * 요청 본문을 안전하게 읽음.
 * Vercel 은 Content-Type: application/json 인데 JSON 이 깨져 있으면 req.body getter 접근 순간 예외를 던지므로
 * 그 경우 500 대신 null(→ 400 invalid-input) 로 처리되게 함
 */
export function readRequestBody(req: { body?: unknown }): unknown {
    let body: unknown
    try {
        body = req.body
    } catch {
        return null
    }
    return readJsonBody(body)
}
