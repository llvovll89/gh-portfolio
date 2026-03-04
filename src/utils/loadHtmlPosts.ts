import type { BlogPost } from "./loadPosts";

// 파일명에서 날짜(YYYY-MM-DD) 추출, 나머지를 slug으로 사용
function parseHtmlFilename(path: string): { slug: string; dateFromFilename: string } {
    const filename = (path.split("/").pop() ?? path.split("\\").pop() ?? path).replace(/\.html$/i, "");
    const dateMatch = filename.match(/^(\d{4}-\d{2}-\d{2})-(.+)$/);
    if (dateMatch) {
        return { slug: "html-" + dateMatch[2], dateFromFilename: dateMatch[1] };
    }
    return { slug: "html-" + filename, dateFromFilename: "" };
}

function extractTextSummary(html: string, maxLength = 160): string {
    const cleaned = html
        .replace(/<script[\s\S]*?<\/script>/gi, "")
        .replace(/<style[\s\S]*?<\/style>/gi, "")
        .replace(/<[^>]+>/g, " ")
        .replace(/&[a-z]+;/gi, " ")
        .replace(/\s+/g, " ")
        .trim();
    return cleaned.length > maxLength ? cleaned.slice(0, maxLength) + "…" : cleaned;
}

function extractMeta(raw: string, name: string): string | undefined {
    const m =
        raw.match(new RegExp(`<meta[^>]+name=["']${name}["'][^>]+content=["']([^"']+)["']`, "i")) ??
        raw.match(new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+name=["']${name}["']`, "i"));
    return m?.[1]?.trim();
}

export function loadHtmlPosts(): BlogPost[] {
    const modules = import.meta.glob("../content/organizingfiles/*.html", {
        eager: true,
        query: "?raw",
        import: "default",
    }) as Record<string, string>;

    return Object.entries(modules).map(([path, raw]) => {
        const { slug, dateFromFilename } = parseHtmlFilename(path);

        const titleMatch = raw.match(/<title[^>]*>([^<]+)<\/title>/i);
        const title = titleMatch ? titleMatch[1].trim() : slug;

        const date = extractMeta(raw, "date") ?? dateFromFilename;
        const keywordsRaw = extractMeta(raw, "keywords");
        const tags = keywordsRaw
            ? keywordsRaw.split(",").map((t) => t.trim()).filter(Boolean)
            : undefined;

        const summary = extractMeta(raw, "description") ?? extractTextSummary(raw);

        return {
            slug,
            title,
            date,
            summary,
            tags,
            body: raw,
            readingTime: "",
            type: "html" as const,
        };
    });
}
