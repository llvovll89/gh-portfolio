import {parseFrontmatter} from "./parseFrontmatter";

export type BlogPost = {
    slug: string;
    title: string;
    date: string; // YYYY-MM-DD
    summary?: string;
    tags?: string[];
    body: string;
};

function toSlugFromPath(path: string) {
    const filename = path.split("/").pop() ?? path.split("\\").pop() ?? path;
    return filename.replace(/\.md$/i, "");
}

export function loadPosts(): BlogPost[] {
    const modules = import.meta.glob("../content/posts/*.md", {
        eager: true,
        query: "?raw",
        import: "default",
    }) as Record<string, string>;

    const posts: BlogPost[] = Object.entries(modules).map(([path, raw]) => {
        const slug = toSlugFromPath(path);
        const {frontmatter, body} = parseFrontmatter(raw);

        const title = String(frontmatter.title ?? slug);
        const date = String(frontmatter.date ?? "");
        const summary = frontmatter.summary
            ? String(frontmatter.summary)
            : undefined;
        const tags = Array.isArray(frontmatter.tags)
            ? (frontmatter.tags as string[])
            : undefined;

        return {slug, title, date, summary, tags, body};
    });

    posts.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
    return posts;
}
