export type CliExportFormat = "txt" | "md";

const pad = (value: number) => value.toString().padStart(2, "0");

const getStamp = (date: Date): string => {
    const y = date.getFullYear();
    const m = pad(date.getMonth() + 1);
    const d = pad(date.getDate());
    const h = pad(date.getHours());
    const min = pad(date.getMinutes());
    const s = pad(date.getSeconds());
    return `${y}${m}${d}-${h}${min}${s}`;
};

const toMarkdown = (content: string): string => {
    return [
        "# Portfolio CLI Session",
        "",
        `- Exported at: ${new Date().toLocaleString("ko-KR")}`,
        "",
        "```text",
        content || "(empty)",
        "```",
        "",
    ].join("\n");
};

export const exportCliSession = (
    content: string,
    format: CliExportFormat = "txt",
): string => {
    const now = new Date();
    const stamp = getStamp(now);
    const extension = format === "md" ? "md" : "txt";
    const fileName = `portfolio-cli-session-${stamp}.${extension}`;

    const normalized = format === "md" ? toMarkdown(content) : content || "(empty)";
    const blob = new Blob([normalized], { type: "text/plain;charset=utf-8" });

    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = fileName;
    anchor.style.display = "none";

    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);

    URL.revokeObjectURL(url);

    return fileName;
};
