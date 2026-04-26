import type { BlogPost } from "../../../../utils/loadPosts";

export const RECENT_STORAGE_KEY = "gh-portfolio:search-recent-paths";
export const FREQUENCY_STORAGE_KEY = "gh-portfolio:search-frequency";
export const SEARCH_HISTORY_KEY = "gh-portfolio:search-history";
export const MAX_RESULTS = 20;
export const MAX_RECENTS = 8;
export const MAX_SEARCH_HISTORY = 5;
export const MAX_BLOG_RESULTS = 10;

// ── 한국어 초성 추출 ─────────────────────────────────────────
const CHO = ["ㄱ","ㄲ","ㄴ","ㄷ","ㄸ","ㄹ","ㅁ","ㅂ","ㅃ","ㅅ","ㅆ","ㅇ","ㅈ","ㅉ","ㅊ","ㅋ","ㅌ","ㅍ","ㅎ"];

function getChosung(str: string): string {
    return [...str]
        .map((ch) => {
            const code = ch.charCodeAt(0) - 0xac00;
            if (code < 0 || code > 11171) return ch;
            return CHO[Math.floor(code / 588)];
        })
        .join("");
}

function isChosungOnly(str: string): boolean {
    return [...str].every((ch) => CHO.includes(ch));
}

export function chosungMatch(text: string, query: string): boolean {
    if (!isChosungOnly(query)) return false;
    const textChosung = getChosung(text.toLowerCase());
    return textChosung.includes(query);
}

// ── 텍스트 유틸 ──────────────────────────────────────────────
export function normalizeQuery(q: string) {
    return q.trim().replace(/\s+/g, " ");
}

export function getKeywords(q: string) {
    const normalized = normalizeQuery(q).toLowerCase();
    if (!normalized) return [];
    return normalized.split(" ").filter(Boolean);
}

export function stripMarkdown(text: string): string {
    return text
        .replace(/```[\s\S]*?```/g, "")
        .replace(/`[^`]+`/g, "")
        .replace(/!\[.*?\]\(.*?\)/g, "")
        .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
        .replace(/^#{1,6}\s+/gm, "")
        .replace(/[*_~>|]/g, "")
        .replace(/\n+/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}

export function extractSnippet(body: string, keywords: string[], maxLen = 90): string | null {
    const stripped = stripMarkdown(body);
    const lower = stripped.toLowerCase();
    for (const k of keywords) {
        const idx = lower.indexOf(k.toLowerCase());
        if (idx >= 0) {
            const start = Math.max(0, idx - 20);
            const end = Math.min(stripped.length, idx + k.length + 60);
            let snippet = stripped.slice(start, end);
            if (start > 0) snippet = "…" + snippet;
            if (end < stripped.length) snippet += "…";
            return snippet.slice(0, maxLen + 4);
        }
    }
    return null;
}

// ── 스코어링 ─────────────────────────────────────────────────
export function scoreRoute(
    routeName: string,
    keywords: string[],
    fullQueryLower: string,
    frequencyMap: Record<string, number>,
    routePath: string,
) {
    const nameLower = routeName.toLowerCase();
    if (!keywords.length) return 0;

    let score = 0;
    let matchedCount = 0;

    if (nameLower === fullQueryLower) score += 200;
    if (nameLower.startsWith(fullQueryLower)) score += 120;

    for (const k of keywords) {
        if (!k) continue;
        const idx = nameLower.indexOf(k);
        if (idx >= 0) {
            matchedCount += 1;
            score += 20;
            if (idx === 0) score += 15;
            if (nameLower === k) score += 30;
        }
        if (chosungMatch(routeName, k)) {
            matchedCount += 1;
            score += 15;
        }
    }

    if (matchedCount === keywords.length) score += 40;
    score += Math.max(0, 20 - routeName.length * 0.5);
    const frequency = frequencyMap[routePath] || 0;
    score += Math.min(frequency * 5, 100);

    return score;
}

export function scoreBlogPost(
    post: BlogPost,
    keywords: string[],
    fullQueryLower: string,
): { score: number; snippet: string | null } {
    if (!keywords.length) return { score: 0, snippet: null };

    const titleLower = post.title.toLowerCase();
    const tagsStr = (post.tags ?? []).join(" ").toLowerCase();
    const summaryStr = (post.summary ?? "").toLowerCase();
    const bodyStripped = stripMarkdown(post.body).toLowerCase();

    let score = 0;

    if (titleLower === fullQueryLower) score += 160;
    if (titleLower.startsWith(fullQueryLower)) score += 90;

    for (const k of keywords) {
        if (titleLower.includes(k)) {
            score += 35;
            if (titleLower.startsWith(k)) score += 10;
        }
        if (chosungMatch(post.title, k)) score += 20;
        if (tagsStr.includes(k)) score += 25;
        if (summaryStr.includes(k)) score += 15;
        if (bodyStripped.includes(k)) score += 8;
    }

    if (keywords.every((k) => titleLower.includes(k))) score += 30;
    if (keywords.every((k) => bodyStripped.includes(k))) score += 10;

    let snippet: string | null = null;
    if (score > 0) {
        const bodyForSnippet = post.summary ? `${post.summary} ${post.body}` : post.body;
        snippet = extractSnippet(bodyForSnippet, keywords);
    }

    return { score, snippet };
}

// ── localStorage 헬퍼 ────────────────────────────────────────
export function loadFrequency(): Record<string, number> {
    try {
        const raw = localStorage.getItem(FREQUENCY_STORAGE_KEY);
        if (!raw) return {};
        const parsed: unknown = JSON.parse(raw);
        if (typeof parsed !== "object" || parsed === null) return {};
        return parsed as Record<string, number>;
    } catch {
        return {};
    }
}

export function saveFrequency(map: Record<string, number>) {
    try { localStorage.setItem(FREQUENCY_STORAGE_KEY, JSON.stringify(map)); } catch { /* ignore */ }
}

export function incrementFrequency(path: string, map: Record<string, number>) {
    const next = { ...map, [path]: (map[path] || 0) + 1 };
    saveFrequency(next);
    return next;
}

export function loadSearchHistory(): string[] {
    try {
        const raw = localStorage.getItem(SEARCH_HISTORY_KEY);
        if (!raw) return [];
        const parsed: unknown = JSON.parse(raw);
        if (!Array.isArray(parsed)) return [];
        return parsed.filter((x): x is string => typeof x === "string");
    } catch {
        return [];
    }
}

export function saveSearchHistory(history: string[]) {
    try { localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(history)); } catch { /* ignore */ }
}

// ── 하이라이트 ───────────────────────────────────────────────
export function escapeRegExp(s: string) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
