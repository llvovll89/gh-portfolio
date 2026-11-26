import { loadPosts } from "./loadPosts";
import { loadHtmlPosts } from "./loadHtmlPosts";
import { parseMarkdownPost, parseHtmlPost, postSlugFromPath, type BlogPost } from "./postMetadata";
export type { BlogPost } from "./postMetadata";

const posts = [...loadPosts(), ...loadHtmlPosts()].sort((a, b) => b.date.localeCompare(a.date));
const bodies = import.meta.glob<string>(["../content/posts/*.md", "../content/organizingfiles/*.html"], { query: "?raw", import: "default" });
// slug → 본문 로더 경로 (파서와 같은 postSlugFromPath 규칙으로 한 번만 매핑)
const loaders = new Map(Object.keys(bodies).map(path => [postSlugFromPath(path), path] as const));

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
