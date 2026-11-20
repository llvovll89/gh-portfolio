import i18n from "../i18n/i18n";

type AskResponse = { answer?: string | null; truncated?: boolean; error?: string };

// 서버가 돌려주는 error 코드 중 사용자에게 따로 안내할 것 (그 외는 fallback 문구)
const KNOWN_ERRORS = new Set(["invalid-input", "rate-limited", "daily-limit", "not-configured", "refused"]);

/** 터미널 `ask` 명령 — /api/ask (Claude) 로 포트폴리오에 대해 질문 */
export async function askPortfolio(question: string): Promise<string> {
    const lang = i18n.language?.startsWith("en") ? "en" : i18n.language?.startsWith("ja") ? "ja" : "ko";
    try {
        const res = await fetch("/api/ask", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ question, lang }),
        });
        const data = await res.json().catch(() => ({})) as AskResponse;
        if (data.answer) return data.truncated ? `${data.answer}\n${i18n.t("ask.truncated")}` : data.answer;
        return i18n.t(KNOWN_ERRORS.has(data.error ?? "") ? `ask.${data.error}` : "ask.fallback");
    } catch {
        return i18n.t("ask.network");
    }
}
