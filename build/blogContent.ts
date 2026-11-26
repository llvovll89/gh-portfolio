import fs from "node:fs";
import type { Plugin } from "vite";
import { parseMarkdownPost, parseHtmlPost, plainSummary } from "../src/utils/postMetadata";

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
            // 검색 인덱스에는 렌더용 원문(마크다운·HTML 문서 전체) 대신 태그·코드 블록을 걷어낸 plain text 만 실어 청크 크기를 줄임
            const body = query === "post-meta" ? "" : plainSummary(post.body, Infinity);
            return "export default " + JSON.stringify({ ...post, body });
        },
    };
}
