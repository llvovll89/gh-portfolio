import Fuse from "fuse.js";
import type { BlogPost } from "./loadPosts";

let fuseInstance: Fuse<BlogPost> | null = null;
let indexedPosts: BlogPost[] | null = null;

function getFuse(posts: BlogPost[]): Fuse<BlogPost> {
    if (fuseInstance && indexedPosts === posts) return fuseInstance;

    fuseInstance = new Fuse(posts, {
        keys: [
            { name: "title",   weight: 3   },
            { name: "tags",    weight: 2   },
            { name: "summary", weight: 2   },
            { name: "body",    weight: 0.8 },
        ],
        threshold: 0.35,
        includeScore: true,
        includeMatches: false,
        minMatchCharLength: 2,
        ignoreLocation: true,
    });
    indexedPosts = posts;
    return fuseInstance;
}

/** Fuse.js 기반 전문 검색. 태그 필터 이후 남은 posts에 대해 실행. */
export function fuseSearch(posts: BlogPost[], query: string): BlogPost[] {
    if (!query.trim()) return posts;
    const fuse = getFuse(posts);
    return fuse.search(query).map((r) => r.item);
}

/** 마크다운 구문을 제거한 plain text 반환 */
function stripMarkdown(md: string): string {
    return md
        .replace(/```[\s\S]*?```/g, "")           // fenced code blocks
        .replace(/`[^`\n]+`/g, "")                // inline code
        .replace(/#{1,6}\s+/g, "")                // headings
        .replace(/!\[[^\]]*\]\([^)]*\)/g, "")     // images
        .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")  // links → keep label
        .replace(/\*{1,3}([^*\n]+)\*{1,3}/g, "$1") // bold/italic
        .replace(/_{1,2}([^_\n]+)_{1,2}/g, "$1")  // underline/italic
        .replace(/^>\s+/gm, "")                   // blockquotes
        .replace(/^[-*+]\s+/gm, "")               // list markers
        .replace(/^\d+\.\s+/gm, "")               // ordered list markers
        .replace(/\n{2,}/g, " ")
        .replace(/\n/g, " ")
        .replace(/\s{2,}/g, " ")
        .trim();
}

/**
 * 포스트 본문에서 키워드 주변 스니펫을 추출.
 * 제목/요약에 이미 표시된 경우 null 반환.
 */
export function getBodySnippet(
    post: BlogPost,
    keywords: string[],
    maxLen = 160
): string | null {
    if (!post.body || post.type === "html") return null;

    const plain = stripMarkdown(post.body);
    const plainLower = plain.toLowerCase();

    for (const kw of keywords) {
        if (!kw || kw.length < 2) continue;
        const kwLower = kw.toLowerCase();

        // 제목/요약에 이미 있으면 본문 스니펫 불필요
        const titleHas = post.title.toLowerCase().includes(kwLower);
        const summaryHas = post.summary?.toLowerCase().includes(kwLower) ?? false;
        if (titleHas || summaryHas) continue;

        const idx = plainLower.indexOf(kwLower);
        if (idx === -1) continue;

        const start = Math.max(0, idx - 50);
        const end = Math.min(plain.length, idx + kw.length + 110);
        const prefix = start > 0 ? "…" : "";
        const suffix = end < plain.length ? "…" : "";
        const snippet = prefix + plain.slice(start, end) + suffix;
        return snippet.length > maxLen ? snippet.slice(0, maxLen) + "…" : snippet;
    }

    return null;
}
