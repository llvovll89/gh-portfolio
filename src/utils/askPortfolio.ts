import i18n from "../i18n/i18n";

type AskResponse = { answer?: string | null; truncated?: boolean; error?: string };

const ERROR_MESSAGES: Record<string, string> = {
    "invalid-input": "질문은 1~300자로 입력해주세요.",
    "rate-limited": "질문이 너무 많아요. 몇 분 뒤에 다시 시도해주세요.",
    "not-configured": "AI 답변 기능이 아직 설정되지 않았어요. contact 페이지로 문의해주세요.",
    refused: "이 질문에는 답할 수 없어요. 건호에 대한 다른 질문을 해보세요.",
};

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
        if (data.answer) return data.truncated ? `${data.answer}\n(답변이 길어 일부가 잘렸어요)` : data.answer;
        return ERROR_MESSAGES[data.error ?? ""] ?? "답변을 가져오지 못했어요. 잠시 후 다시 시도해주세요.";
    } catch {
        return "네트워크 오류로 답변을 가져오지 못했어요.";
    }
}
