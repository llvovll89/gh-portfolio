// /api/ask 입력 검증

export const ASK_LIMITS = { questionMaxLength: 300, windowMs: 10 * 60 * 1000, maxPerWindow: 8 } as const

export type AskLang = 'ko' | 'en' | 'ja'
export type AskInput = { question: string; lang: AskLang }

export function parseAskInput(body: unknown): AskInput | null {
    if (!body || typeof body !== 'object') return null
    const { question, lang } = body as Record<string, unknown>
    if (typeof question !== 'string') return null
    const trimmed = question.trim()
    if (!trimmed || trimmed.length > ASK_LIMITS.questionMaxLength) return null
    const safeLang: AskLang = lang === 'en' || lang === 'ja' ? lang : 'ko'
    return { question: trimmed, lang: safeLang }
}
