import { parseFrontmatter } from "./parseFrontmatter";
import { calculateReadingTime } from "./readingTime";

export type BlogPost = {
    slug: string;
    title: string;
    date: string;
    summary?: string;
    tags?: string[];
    category?: string;
    body: string;
    readingTime: string;
    type?: "md" | "html";
};

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

export function parseMarkdownPost(path: string, raw: string): BlogPost {
    const slug = (path.split(/[\\/]/).pop() ?? path).replace(/\.md$/i, "");
    const { frontmatter, body } = parseFrontmatter(raw);
    return {
        slug,
        title: String(frontmatter.title ?? slug),
        date: String(frontmatter.date ?? ""),
        summary: frontmatter.summary ? String(frontmatter.summary) : plainSummary(body),
        tags: Array.isArray(frontmatter.tags) ? frontmatter.tags as string[] : undefined,
        category: frontmatter.category ? String(frontmatter.category) : undefined,
        body,
        readingTime: calculateReadingTime(body),
        type: "md",
    };
}

export function parseHtmlPost(path: string, raw: string): BlogPost {
    const filename = (path.split(/[\\/]/).pop() ?? path).replace(/\.html$/i, "");
    const dateMatch = filename.match(/^(\d{4}-\d{2}-\d{2})-(.+)$/);
    const slug = "html-" + (dateMatch?.[2] ?? filename);
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
        summary: meta("description") ?? plainSummary(raw),
        tags: meta("keywords")?.split(",").map(tag => tag.trim()).filter(Boolean),
        category: meta("category"),
        body: raw,
        readingTime: "",
        type: "html",
    };
}
