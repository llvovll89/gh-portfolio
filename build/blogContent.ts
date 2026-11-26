import fs from "node:fs";
import path from "node:path";
import type { Plugin } from "vite";
import { parseMarkdownPost, parseHtmlPost, plainSummary, validatePost } from "../src/utils/postMetadata";

const CONTENT_DIRS = [
    { dir: "src/content/posts", ext: ".md" },
    { dir: "src/content/organizingfiles", ext: ".html" },
] as const;

const parse = (filename: string, raw: string) => filename.endsWith(".md") ? parseMarkdownPost(filename, raw) : parseHtmlPost(filename, raw);

/** Emit lightweight listing data separately from on-demand raw bodies and search. */
export function blogContent(): Plugin {
    return {
        name: "blog-content-index",
        enforce: "pre",
        // 메타데이터 오류·slug 중복(같은 이름의 HTML 글 등)은 조용히 덮어쓰지 말고 빌드를 실패시킴
        buildStart() {
            const seen = new Map<string, string>();
            const problems: string[] = [];
            for (const { dir, ext } of CONTENT_DIRS) {
                for (const file of fs.readdirSync(dir).filter(name => name.endsWith(ext))) {
                    const filename = path.join(dir, file);
                    const raw = fs.readFileSync(filename, "utf8");
                    const post = parse(filename, raw);
                    for (const error of validatePost(post, raw)) problems.push(`${filename}: ${error}`);
                    const previous = seen.get(post.slug);
                    if (previous) problems.push(`slug 중복 "${post.slug}": ${previous}, ${filename}`);
                    seen.set(post.slug, filename);
                }
            }
            if (problems.length > 0) this.error("블로그 콘텐츠 검증 실패\n" + problems.join("\n"));
        },
        load(id) {
            const [filename, query] = id.split("?");
            if (query !== "post-meta" && query !== "post-search") return;
            const raw = fs.readFileSync(filename, "utf8");
            const post = parse(filename, raw);
            this.addWatchFile(filename);
            // 검색 인덱스에는 렌더용 원문(마크다운·HTML 문서 전체) 대신 태그·코드 블록을 걷어낸 plain text 만 실어 청크 크기를 줄임
            const body = query === "post-meta" ? "" : plainSummary(post.body, Infinity);
            return "export default " + JSON.stringify({ ...post, body });
        },
    };
}
