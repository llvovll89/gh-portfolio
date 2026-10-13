import type { BlogPost } from "./postMetadata";

export function loadHtmlPosts(): BlogPost[] {
    const modules = import.meta.glob<BlogPost>("../content/organizingfiles/*.html", {
        eager: true, query: "?post-meta", import: "default",
    });
    return Object.values(modules);
}
