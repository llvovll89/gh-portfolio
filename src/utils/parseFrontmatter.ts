export type Frontmatter = Record<string, string | string[]>;

const unquote = (value: string) => value.trim().replace(/^(["'])(.*)\1$/, "$2");

export function parseFrontmatter(markdown: string): {
    frontmatter: Frontmatter;
    body: string;
} {
    const trimmed = markdown.replace(/^\uFEFF/, "");

    if (!trimmed.startsWith("---")) {
        return {frontmatter: {}, body: trimmed};
    }

    const end = trimmed.indexOf("\n---", 3);
    if (end === -1) return {frontmatter: {}, body: trimmed};

    const raw = trimmed.slice(3, end).trim();
    const body = trimmed.slice(end + "\n---".length).trimStart();

    const fm: Frontmatter = {};
    let listKey: string | null = null;
    const blockKeys = new Set<string>();
    for (const line of raw.split(/\r?\n/)) {
        // YAML 블록 리스트: `tags:` 다음 줄의 `  - 값`
        const item = /^\s*-\s+(.*)$/.exec(line);
        if (item && listKey) {
            (fm[listKey] as string[]).push(unquote(item[1]));
            continue;
        }
        listKey = null;

        const idx = line.indexOf(":");
        if (idx === -1) continue;

        const key = line.slice(0, idx).trim();
        const value = line.slice(idx + 1).trim();

        if (value === "") {
            fm[key] = [];
            blockKeys.add(key);
            listKey = key;
            continue;
        }
        if (value.startsWith("[") && value.endsWith("]")) {
            const inner = value.slice(1, -1).trim();
            // 항목별로 따옴표 제거 (`["a", "b"]` 형식)
            fm[key] = inner ? inner.split(",").map(unquote).filter(Boolean) : [];
            continue;
        }

        fm[key] = unquote(value);
    }

    // 값이 비어 있고 뒤따르는 리스트 항목도 없으면 기존처럼 빈 문자열로 둠 (`summary:` 빈 값 → 자동 요약 대상)
    for (const key of blockKeys) {
        if ((fm[key] as string[]).length === 0) fm[key] = "";
    }

    return {frontmatter: fm, body};
}
