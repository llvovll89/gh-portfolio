import fs from "node:fs";
import type { Plugin } from "vite";
import { parseMarkdownPost, parseHtmlPost } from "../src/utils/postMetadata";

/** Emit lightweight listing data separately from on-demand raw bodies and search. */
export function blogContent(): Plugin {
    return {
        name: "blog-content-index",
        enforce: "pre",
        load(id) {
            const [filename, query] = id.split("?");
            if (query !== "post-meta" && query !== "post-search") return;
            const raw = fs.readFileSync(filename, "utf8");
            const post = filename.endsWith(".md") ? parseMarkdownPost(filename, raw) : parseHtmlPost(filename, raw);
            this.addWatchFile(filename);
            return "export default " + JSON.stringify({ ...post, body: query === "post-meta" ? "" : post.body });
        },
    };
}
