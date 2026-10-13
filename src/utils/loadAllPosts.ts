import { loadPosts } from "./loadPosts";
import { loadHtmlPosts } from "./loadHtmlPosts";
import { parseMarkdownPost, parseHtmlPost, type BlogPost } from "./postMetadata";
export type { BlogPost } from "./postMetadata";

const posts = [...loadPosts(), ...loadHtmlPosts()].sort((a, b) => b.date.localeCompare(a.date));
const bodies = import.meta.glob<string>(["../content/posts/*.md", "../content/organizingfiles/*.html"], { query: "?raw", import: "default" });
const loaders = new Map(posts.map(post => {
    const path = Object.keys(bodies).find(path => {
        const filename = path.split("/").pop() ?? "";
        return post.type === "html"
            ? "html-" + filename.replace(/\.html$/i, "").replace(/^\d{4}-\d{2}-\d{2}-/, "") === post.slug
            : filename.replace(/\.md$/i, "") === post.slug;
    });
    return [post.slug, path] as const;
}));

export const loadAllPosts = (): BlogPost[] => posts;

export async function loadPost(slug: string): Promise<BlogPost | undefined> {
    const path = loaders.get(slug);
    if (!path) return;
    const raw = await bodies[path]();
    return path.endsWith(".md") ? parseMarkdownPost(path, raw) : parseHtmlPost(path, raw);
}

let searchPromise: Promise<BlogPost[]> | undefined;
export function loadSearchPosts(): Promise<BlogPost[]> {
    searchPromise ??= import("./searchPosts").then(module => module.default).catch(error => {
        searchPromise = undefined;
        throw error;
    });
    return searchPromise;
}
