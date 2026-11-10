// 명령 팔레트의 상수·타입·저장소 헬퍼 (UI 와 분리)
import { ThemeMode } from "@/context/constants/Theme.type";

export const RECENT_COMMANDS_STORAGE_KEY = "portfolio-command-palette-recent";
export const PINNED_COMMANDS_STORAGE_KEY = "portfolio-command-palette-pinned";
export const COMMAND_USAGE_STATS_STORAGE_KEY = "portfolio-command-palette-usage-stats";
export const COMMAND_USAGE_STORAGE_VERSION = 1;
export const MAX_RECENT_COMMANDS = 6;
export const MAX_PINNED_COMMANDS = 8;
export const MAX_RECOMMENDED_COMMANDS = 5;

export type CommandUsageStats = Record<string, { count: number; lastUsedAt: number }>;
export type CommandUsageStorage = {
    version: number;
    stats: CommandUsageStats;
};


export const CATEGORY_ORDER: Command["category"][] = [
    "Navigation",
    "Layout",
    "Theme",
    "Language",
    "System",
];

export const THEME_LABELS: Record<Exclude<ThemeMode, ThemeMode.CUSTOM>, string> = {
    [ThemeMode.SYSTEM]: "테마: 시스템 설정",
    [ThemeMode.LIGHT]: "테마: 밝은 화면",
    [ThemeMode.DARK]: "테마: 검은배경",
    [ThemeMode.BASE_NAVY]: "테마: 짙은 남색",
    [ThemeMode.SUB_BLUE]: "테마: 파란하늘",
    [ThemeMode.SUB_PINK]: "테마: 분홍빛",
    [ThemeMode.SUB_GREEN]: "테마: 짙은 숲",
    [ThemeMode.MAIN_TEAL]: "테마: 푸른숲",
    [ThemeMode.SUB_TEAL]: "테마: 푸른 나무",
};

export const THEME_MODE_ORDER = Object.keys(THEME_LABELS) as Array<Exclude<ThemeMode, ThemeMode.CUSTOM>>;

export const LANGUAGE_LABELS = {
    ko: "언어: 한국어",
    en: "언어: English",
    ja: "언어: 日本語",
} as const;

export interface Command {
    id: string;
    label: string;
    description: string;
    shortcut: string;
    category: "Layout" | "Navigation" | "Theme" | "Language" | "System";
    keywords?: string[];
    quickHint?: string;
    action: () => void;
}

export interface CommandSectionRow {
    type: "section";
    id: string;
    label: string;
}

export interface CommandItemRow {
    type: "command";
    command: Command;
    index: number;
}

export type CommandRow = CommandSectionRow | CommandItemRow;

export function readStoredList(key: string): string[] {
    try { const value: unknown = JSON.parse(localStorage.getItem(key) ?? "[]"); return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : []; } catch { return []; }
}
export function readUsageStats(): CommandUsageStats {
    try {
        const stored = JSON.parse(localStorage.getItem(COMMAND_USAGE_STATS_STORAGE_KEY) ?? "{}") as { stats?: unknown };
        const stats = (stored.stats ?? stored) as Record<string, unknown>;
        return Object.fromEntries(Object.entries(stats).filter(([, value]) => {
            if (!value || typeof value !== "object") return false;
            const entry = value as { count?: unknown; lastUsedAt?: unknown };
            return typeof entry.count === "number" && Number.isFinite(entry.count) && entry.count >= 0 && typeof entry.lastUsedAt === "number" && Number.isFinite(entry.lastUsedAt);
        })) as CommandUsageStats;
    } catch { return {}; }
}
