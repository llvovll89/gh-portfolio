import type { IconType } from "react-icons";
import { SiReact, SiMarkdown } from "react-icons/si";
import { PATHS } from "../routes/route";

export type FileIconInfo = {
    Icon: IconType;
    colorClass: string;
    languageLabel: string;
};

const DEFAULT_FILE_ICON: FileIconInfo = {
    Icon: SiReact,
    colorClass: "text-primary",
    languageLabel: "TypeScript React",
};

const FILE_ICON_MAP: Partial<Record<string, FileIconInfo>> = {
    [PATHS.BLOG]: { Icon: SiMarkdown, colorClass: "text-muted", languageLabel: "Markdown" },
    [PATHS.BLOG_DETAIL]: { Icon: SiMarkdown, colorClass: "text-muted", languageLabel: "Markdown" },
};

export const getFileIcon = (path: string): FileIconInfo => FILE_ICON_MAP[path] ?? DEFAULT_FILE_ICON;
