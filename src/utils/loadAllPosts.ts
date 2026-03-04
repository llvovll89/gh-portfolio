import { loadPosts, type BlogPost } from "./loadPosts";
import { loadHtmlPosts } from "./loadHtmlPosts";

export type { BlogPost };

export function loadAllPosts(): BlogPost[] {
    const mdPosts = loadPosts();
    const htmlPosts = loadHtmlPosts();
    const combined = [...mdPosts, ...htmlPosts];
    combined.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
    return combined;
}
