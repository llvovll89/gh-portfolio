import type { BlogPost } from "./postMetadata";
export type { BlogPost } from "./postMetadata";

export function loadPosts(): BlogPost[] {
    const modules = import.meta.glob<BlogPost>("../content/posts/*.md", {
        eager: true, query: "?post-meta", import: "default",
    });
    return Object.values(modules).sort((a, b) => b.date.localeCompare(a.date));
}
