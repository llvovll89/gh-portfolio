export type Frontmatter = Record<string, unknown>;

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
    for (const line of raw.split("\n")) {
        const idx = line.indexOf(":");
        if (idx === -1) continue;

        const key = line.slice(0, idx).trim();
        let value = line.slice(idx + 1).trim();

        if (value.startsWith("[") && value.endsWith("]")) {
            value = value.slice(1, -1).trim();
            fm[key] = value ? value.split(",").map((v) => v.trim()) : [];
            continue;
        }

        fm[key] = value.replace(/^["']|["']$/g, "");
    }

    return {frontmatter: fm, body};
}
