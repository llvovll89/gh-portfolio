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

type HeaderSource = { headers: Record<string, string | string[] | undefined> }

function header(req: HeaderSource, name: string): string | undefined {
    const value = req.headers[name]
    return Array.isArray(value) ? value[0] : value
}

/**
 * 교차 출처 POST 차단 — 거부 사유(HTTP status)를 반환, 통과면 null.
 * text/plain 같은 "단순 요청"은 CORS preflight 없이 다른 사이트에서 보낼 수 있으므로
 * Content-Type 을 application/json 으로 강제하고, 브라우저가 붙이는 Sec-Fetch-Site / Origin 으로 동일 출처만 허용.
 * 두 헤더가 모두 없으면(curl·서버 간 호출) 브라우저 CSRF 경로가 아니므로 허용.
 */
export function rejectCrossSite(req: HeaderSource): 403 | 415 | null {
    const contentType = header(req, 'content-type') ?? ''
    if (!/^application\/json\b/i.test(contentType.trim())) return 415

    const fetchSite = header(req, 'sec-fetch-site')
    if (fetchSite) return fetchSite === 'same-origin' ? null : 403

    const origin = header(req, 'origin')
    if (!origin) return null
    const host = header(req, 'x-forwarded-host') ?? header(req, 'host')
    try {
        return host && new URL(origin).host === host ? null : 403
    } catch {
        return 403
    }
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
