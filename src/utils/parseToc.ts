export type TocItem = {
    id: string;
    text: string;
    level: 2 | 3;
};

export function slugifyHeading(text: string): string {
    return text
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9\-가-힣]/g, "")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");
}

export function parseToc(markdown: string): TocItem[] {
    const lines = markdown.split("\n");
    const items: TocItem[] = [];
    const idCounts = new Map<string, number>();
    // 코드 블록 안의 `## 주석` 은 실제 제목이 아니므로 제외 (렌더러의 id 순번과 어긋나지 않도록)
    let fence: string | null = null;

    for (const line of lines) {
        const fenceMatch = line.match(/^\s{0,3}(`{3,}|~{3,})/);
        if (fenceMatch) {
            const marker = fenceMatch[1];
            if (fence === null) fence = marker;
            else if (marker[0] === fence[0] && marker.length >= fence.length) fence = null;
            continue;
        }
        if (fence !== null) continue;

        // h3 먼저 체크 (## 패턴이 ### 에도 매칭되므로)
        const h3Match = line.match(/^###\s+(.+)/);
        if (h3Match) {
            const text = h3Match[1].trim();
            const baseId = slugifyHeading(text);
            const count = (idCounts.get(baseId) ?? 0) + 1;
            idCounts.set(baseId, count);
            const id = count > 1 ? `${baseId}-${count}` : baseId;
            items.push({ id, text, level: 3 });
            continue;
        }

        const h2Match = line.match(/^##\s+(.+)/);
        if (h2Match) {
            const text = h2Match[1].trim();
            const baseId = slugifyHeading(text);
            const count = (idCounts.get(baseId) ?? 0) + 1;
            idCounts.set(baseId, count);
            const id = count > 1 ? `${baseId}-${count}` : baseId;
            items.push({ id, text, level: 2 });
        }
    }

    return items;
}
