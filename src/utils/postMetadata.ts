import { parseFrontmatter } from "./parseFrontmatter";
import { calculateReadingTime } from "./readingTime";

export type BlogPost = {
    slug: string;
    title: string;
    date: string;
    updated?: string;
    summary?: string;
    tags?: string[];
    category?: string;
    /** 블로그 상단에 고정되는 대표 글 */
    featured?: boolean;
    body: string;
    readingTime: string;
    type?: "md" | "html";
};

// 빌드(sharp 생성)와 클라이언트(useSeoMeta)가 같은 OG 이미지 경로를 계산하도록 동기 해시(cyrb53) 사용
export function postOgImagePath(slug: string): string {
    let h1 = 0xdeadbeef, h2 = 0x41c6ce57;
    for (let i = 0; i < slug.length; i++) {
        const ch = slug.charCodeAt(i);
        h1 = Math.imul(h1 ^ ch, 2654435761);
        h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    return "/og/posts/" + (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(36) + ".png";
}

export function plainSummary(raw: string, maxLength = 160): string {
    return raw.replace(/<script[\s\S]*?<\/script>/gi, "")
        .replace(/<style[\s\S]*?<\/style>/gi, "")
        .replace(/<[^>]+>/g, " ")
        .replace(/\x60{3}[\s\S]*?\x60{3}/g, " ")
        .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
        .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
        .replace(/^[#>*+-]+\s*/gm, "")
        .replace(/[\x60*]/g, "")
        .replace(/&[a-z]+;/gi, " ")
        .replace(/\s+/g, " ").trim().slice(0, maxLength);
}

/** 파일 경로 → URL slug (마크다운: 파일명, HTML: 'html-' + 날짜 접두사를 뺀 파일명) — 파서와 본문 로더가 같은 규칙을 쓰도록 단일화 */
export function postSlugFromPath(path: string): string {
    const filename = path.split(/[\\/]/).pop() ?? path;
    if (/\.html$/i.test(filename)) return "html-" + filename.replace(/\.html$/i, "").replace(/^\d{4}-\d{2}-\d{2}-/, "");
    return filename.replace(/\.md$/i, "");
}

export function parseMarkdownPost(path: string, raw: string): BlogPost {
    const slug = postSlugFromPath(path);
    const { frontmatter, body } = parseFrontmatter(raw);
    return {
        slug,
        title: String(frontmatter.title ?? slug),
        date: String(frontmatter.date ?? ""),
        updated: frontmatter.updated ? String(frontmatter.updated) : undefined,
        summary: frontmatter.summary ? String(frontmatter.summary) : plainSummary(body),
        // `tags: a, b` 처럼 대괄호 없이 쓴 경우도 목록으로 해석
        tags: Array.isArray(frontmatter.tags) ? frontmatter.tags
            : frontmatter.tags ? frontmatter.tags.split(",").map(tag => tag.trim()).filter(Boolean) : undefined,
        category: frontmatter.category ? String(frontmatter.category) : undefined,
        featured: String(frontmatter.featured).toLowerCase() === "true" || undefined,
        body,
        readingTime: calculateReadingTime(body),
        type: "md",
    };
}

export function parseHtmlPost(path: string, raw: string): BlogPost {
    const filename = (path.split(/[\\/]/).pop() ?? path).replace(/\.html$/i, "");
    const dateMatch = filename.match(/^(\d{4}-\d{2}-\d{2})-(.+)$/);
    const slug = postSlugFromPath(path);
    const meta = (name: string) => {
        const tags = raw.match(/<meta\b[^>]*>/gi) ?? [];
        for (const tag of tags) {
            const nameMatch = tag.match(/\bname=["']([^"']+)["']/i);
            if (nameMatch?.[1].toLowerCase() === name.toLowerCase()) return tag.match(/\bcontent=["']([^"']*)["']/i)?.[1].trim();
        }
    };
    return {
        slug,
        title: raw.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1].trim() ?? slug,
        date: meta("date") ?? dateMatch?.[1] ?? "",
        updated: meta("updated"),
        summary: meta("description") ?? plainSummary(raw),
        tags: meta("keywords")?.split(",").map(tag => tag.trim()).filter(Boolean),
        category: meta("category"),
        body: raw,
        readingTime: "",
        type: "html",
    };
}

export const POST_CATEGORIES = ["Frontend", "Backend", "AI", "CS", "DevOps", "Notes"] as const;

/** 빌드를 막아야 하는 메타데이터 오류 목록 (빈 배열이면 정상) — 제목 누락·잘못된 날짜·허용 외 category */
export function validatePost(post: BlogPost, raw: string): string[] {
    const errors: string[] = [];
    if (post.type === "md" && !parseFrontmatter(raw).frontmatter.title) errors.push("frontmatter title 누락");
    if (!/^\d{4}-\d{2}-\d{2}$/.test(post.date) || Number.isNaN(Date.parse(post.date))) errors.push(`date 형식 오류: "${post.date}" (YYYY-MM-DD)`);
    if (post.type === "md" && !POST_CATEGORIES.includes(post.category as (typeof POST_CATEGORIES)[number])) {
        errors.push(`category 오류: "${post.category ?? ""}" (${POST_CATEGORIES.join(" | ")})`);
    }
    return errors;
}
