import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { KeyboardContext } from "@/context/KeyboardState.context";
import { LayoutContext } from "@/context/LayoutContext";
import { NavigationContext } from "@/context/NavigationContext";
import { ThemeContext } from "@/context/ThemeContext";
import { NavType } from "@/components/aside/constants/Nav.type";
import {
    DEFAULT_KEY_COMBINATIONS,
    formatKeyCombo,
    LAYOUT_HEIGHTS,
    SHORTCUT_DESCRIPTIONS_KO,
} from "@/constants/keyboardConstants";
import { KeyboardShortcutId } from "@/types/Keyboard.types";
import { useFocusTrap } from "@/hooks/useKeyboardNavigation";
import { useHandlePushPath } from "@/hooks/useHandlePushPath";
import {
    BLOG,
    CONTACT,
    DEFAULT,
    GUESTBOOK,
    PROJECTS,
    RESUME,
    USES,
} from "@/routes/route";
import { ThemeMode } from "@/context/constatns/Theme.type";
import { useTranslation } from "react-i18next";

const RECENT_COMMANDS_STORAGE_KEY = "portfolio-command-palette-recent";
const PINNED_COMMANDS_STORAGE_KEY = "portfolio-command-palette-pinned";
const COMMAND_USAGE_STATS_STORAGE_KEY = "portfolio-command-palette-usage-stats";
const COMMAND_USAGE_STORAGE_VERSION = 1;
const SETTINGS_STORAGE_KEY = "portfolio-settings";
const SETTINGS_BADGE_STORAGE_KEY = "portfolio-settings-has-updates";
const SETTINGS_UPDATED_EVENT = "portfolio-settings-updated";
const MAX_RECENT_COMMANDS = 6;
const MAX_PINNED_COMMANDS = 8;
const MAX_RECOMMENDED_COMMANDS = 5;

type CommandUsageStats = Record<string, { count: number; lastUsedAt: number }>;
type CommandUsageStorage = {
    version: number;
    stats: CommandUsageStats;
};

const CATEGORY_LABELS: Record<Command["category"], string> = {
    Layout: "Layout",
    Navigation: "Navigation",
    Theme: "Theme",
    Language: "Language",
    System: "System",
};

const CATEGORY_ORDER: Command["category"][] = [
    "Navigation",
    "Layout",
    "Theme",
    "Language",
    "System",
];

const THEME_LABELS: Record<Exclude<ThemeMode, ThemeMode.CUSTOM>, string> = {
    [ThemeMode.DARK]: "테마: 검은배경",
    [ThemeMode.BASE_NAVY]: "테마: 짙은 남색",
    [ThemeMode.SUB_BLUE]: "테마: 파란하늘",
    [ThemeMode.SUB_PINK]: "테마: 분홍빛",
    [ThemeMode.SUB_GREEN]: "테마: 짙은 숲",
    [ThemeMode.MAIN_TEAL]: "테마: 푸른숲",
    [ThemeMode.SUB_TEAL]: "테마: 푸른 나무",
};

const LANGUAGE_LABELS = {
    ko: "언어: 한국어",
    en: "언어: English",
    ja: "언어: 日本語",
} as const;

interface Command {
    id: string;
    label: string;
    description: string;
    shortcut: string;
    category: "Layout" | "Navigation" | "Theme" | "Language" | "System";
    keywords?: string[];
    quickHint?: string;
    action: () => void;
}

interface CommandSectionRow {
    type: "section";
    id: string;
    label: string;
}

interface CommandItemRow {
    type: "command";
    command: Command;
    index: number;
}

type CommandRow = CommandSectionRow | CommandItemRow;

function Highlight({ text, query }: { text: string; query: string }) {
    if (!query) return <>{text}</>
    const idx = text.toLowerCase().indexOf(query.toLowerCase())
    if (idx === -1) return <>{text}</>
    return (
        <>
            {text.slice(0, idx)}
            <mark className="bg-yellow-400/30 text-inherit rounded-sm">{text.slice(idx, idx + query.length)}</mark>
            {text.slice(idx + query.length)}
        </>
    )
}

/**
 * 명령 팔레트 컴포넌트
 * @description Ctrl+Shift+P로 호출되는 VS Code 스타일 명령 팔레트
 */
export const CommandPalette = () => {
    const { i18n } = useTranslation();
    const {
        isVisibleCommandPalette,
        setIsVisibleCommandPalette,
        toggleKeyboardInfo,
    } = useContext(KeyboardContext);
    const { setLayoutState } = useContext(LayoutContext);
    const { setSelectedNav, closedTabs, setClosedTabs, selectedPathState, setPinnedTabs } = useContext(NavigationContext);
    const { setSelectedTheme } = useContext(ThemeContext);
    const handlePushPath = useHandlePushPath();

    const [searchQuery, setSearchQuery] = useState("");
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [recentCommandIds, setRecentCommandIds] = useState<string[]>([]);
    const [pinnedCommandIds, setPinnedCommandIds] = useState<string[]>([]);
    const [showPinnedOnly, setShowPinnedOnly] = useState(false);
    const [usageStats, setUsageStats] = useState<CommandUsageStats>({});
    const inputRef = useRef<HTMLInputElement>(null);
    const containerRef = useFocusTrap(isVisibleCommandPalette);

    useEffect(() => {
        try {
            const stored = localStorage.getItem(RECENT_COMMANDS_STORAGE_KEY);
            if (!stored) return;
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed)) {
                setRecentCommandIds(parsed.filter((v) => typeof v === "string"));
            }
        } catch {
            // ignore storage parsing errors
        }
    }, []);

    useEffect(() => {
        try {
            const stored = localStorage.getItem(PINNED_COMMANDS_STORAGE_KEY);
            if (!stored) return;
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed)) {
                setPinnedCommandIds(parsed.filter((v) => typeof v === "string"));
            }
        } catch {
            // ignore storage parsing errors
        }
    }, []);

    useEffect(() => {
        try {
            const stored = localStorage.getItem(COMMAND_USAGE_STATS_STORAGE_KEY);
            if (!stored) return;
            const parsed = JSON.parse(stored) as CommandUsageStats | CommandUsageStorage;
            if (!parsed || typeof parsed !== "object") return;

            const rawStats = "stats" in parsed
                ? parsed.stats
                : parsed;

            if (!rawStats || typeof rawStats !== "object") return;

            const sanitized = Object.fromEntries(
                Object.entries(rawStats).filter(([, value]) => {
                    if (!value || typeof value !== "object") return false;
                    const count = (value as { count?: unknown }).count;
                    const lastUsedAt = (value as { lastUsedAt?: unknown }).lastUsedAt;
                    return (
                        typeof count === "number" &&
                        count >= 0 &&
                        typeof lastUsedAt === "number" &&
                        Number.isFinite(lastUsedAt)
                    );
                }),
            ) as CommandUsageStats;

            setUsageStats(sanitized);
        } catch {
            // ignore storage parsing errors
        }
    }, []);

    const setLanguage = (next: "ko" | "en" | "ja") => {
        i18n.changeLanguage(next);
        try {
            const existing = JSON.parse(localStorage.getItem(SETTINGS_STORAGE_KEY) ?? "{}");
            localStorage.setItem(
                SETTINGS_STORAGE_KEY,
                JSON.stringify({ ...existing, language: next }),
            );
            localStorage.setItem(SETTINGS_BADGE_STORAGE_KEY, "1");
            window.dispatchEvent(
                new CustomEvent(SETTINGS_UPDATED_EVENT, { detail: { dirty: true } }),
            );
        } catch {
            // ignore storage errors
        }
    };

    // 사용 가능한 명령 목록
    const commands: Command[] = [
        {
            id: KeyboardShortcutId.TOGGLE_KEYBOARD_INFO,
            label: SHORTCUT_DESCRIPTIONS_KO[KeyboardShortcutId.TOGGLE_KEYBOARD_INFO],
            description: "사용 가능한 키보드 단축키 전체 목록을 확인합니다",
            shortcut: formatKeyCombo(
                DEFAULT_KEY_COMBINATIONS[KeyboardShortcutId.TOGGLE_KEYBOARD_INFO],
            ),
            category: "System",
            keywords: ["shortcut", "help", "info", "단축키"],
            action: toggleKeyboardInfo,
        },
        {
            id: KeyboardShortcutId.TOGGLE_FOOTER,
            label: SHORTCUT_DESCRIPTIONS_KO[KeyboardShortcutId.TOGGLE_FOOTER],
            description: "하단 터미널 패널을 열거나 닫습니다",
            shortcut: formatKeyCombo(
                DEFAULT_KEY_COMBINATIONS[KeyboardShortcutId.TOGGLE_FOOTER],
            ),
            category: "Layout",
            keywords: ["terminal", "footer", "panel", "터미널"],
            action: () => {
                setLayoutState((prev) => {
                    const isOpen =
                        prev.resizeFooterHeight > LAYOUT_HEIGHTS.FOOTER_COLLAPSED;
                    return {
                        ...prev,
                        resizeFooterHeight: isOpen
                            ? LAYOUT_HEIGHTS.FOOTER_COLLAPSED
                            : LAYOUT_HEIGHTS.FOOTER_OPEN,
                    };
                });
            },
        },
        {
            id: KeyboardShortcutId.TOGGLE_FOLDER,
            label: SHORTCUT_DESCRIPTIONS_KO[KeyboardShortcutId.TOGGLE_FOLDER],
            description: "좌측 파일 탐색기 패널을 토글합니다",
            shortcut: formatKeyCombo(
                DEFAULT_KEY_COMBINATIONS[KeyboardShortcutId.TOGGLE_FOLDER],
            ),
            category: "Navigation",
            keywords: ["folder", "explorer", "files", "폴더"],
            action: () => {
                setSelectedNav((prev) =>
                    prev === NavType.FOLDER ? null : NavType.FOLDER,
                );
            },
        },
        {
            id: KeyboardShortcutId.TOGGLE_SEARCH,
            label: SHORTCUT_DESCRIPTIONS_KO[KeyboardShortcutId.TOGGLE_SEARCH],
            description: "파일 및 콘텐츠 검색 패널을 열거나 닫습니다",
            shortcut: formatKeyCombo(
                DEFAULT_KEY_COMBINATIONS[KeyboardShortcutId.TOGGLE_SEARCH],
            ),
            category: "Navigation",
            keywords: ["search", "find", "검색"],
            action: () => {
                setSelectedNav((prev) =>
                    prev === NavType.SEARCH ? null : NavType.SEARCH,
                );
            },
        },
        {
            id: KeyboardShortcutId.TOGGLE_SIDEBAR,
            label: SHORTCUT_DESCRIPTIONS_KO[KeyboardShortcutId.TOGGLE_SIDEBAR],
            description: "사이드바 전체를 숨기거나 표시합니다",
            shortcut: formatKeyCombo(
                DEFAULT_KEY_COMBINATIONS[KeyboardShortcutId.TOGGLE_SIDEBAR],
            ),
            category: "Layout",
            keywords: ["sidebar", "layout", "사이드바"],
            action: () => {
                setLayoutState((prev) => ({
                    ...prev,
                    resizeSidebarWidth: prev.resizeSidebarWidth > 0 ? 0 : 250,
                }));
            },
        },
        {
            id: KeyboardShortcutId.TOGGLE_PANEL,
            label: SHORTCUT_DESCRIPTIONS_KO[KeyboardShortcutId.TOGGLE_PANEL],
            description: "하단 패널을 열거나 닫습니다",
            shortcut: formatKeyCombo(
                DEFAULT_KEY_COMBINATIONS[KeyboardShortcutId.TOGGLE_PANEL],
            ),
            category: "Layout",
            keywords: ["panel", "bottom", "터미널"],
            action: () => {
                setLayoutState((prev) => {
                    const isOpen =
                        prev.resizeFooterHeight > LAYOUT_HEIGHTS.FOOTER_COLLAPSED;
                    return {
                        ...prev,
                        resizeFooterHeight: isOpen
                            ? LAYOUT_HEIGHTS.FOOTER_COLLAPSED
                            : LAYOUT_HEIGHTS.FOOTER_OPEN,
                    };
                });
            },
        },
        {
            id: KeyboardShortcutId.REOPEN_CLOSED_TAB,
            label: SHORTCUT_DESCRIPTIONS_KO[KeyboardShortcutId.REOPEN_CLOSED_TAB],
            description: "가장 최근에 닫은 탭을 다시 엽니다",
            shortcut: formatKeyCombo(
                DEFAULT_KEY_COMBINATIONS[KeyboardShortcutId.REOPEN_CLOSED_TAB],
            ),
            category: "Navigation",
            keywords: ["reopen", "tab", "undo close", "복원"],
            action: () => {
                const lastClosed = closedTabs[closedTabs.length - 1];
                if (!lastClosed) return;
                setClosedTabs((prev) => prev.slice(0, -1));
                handlePushPath(lastClosed);
            },
        },
        {
            id: KeyboardShortcutId.TOGGLE_PIN_CURRENT_TAB,
            label: SHORTCUT_DESCRIPTIONS_KO[KeyboardShortcutId.TOGGLE_PIN_CURRENT_TAB],
            description: "현재 활성 탭을 고정하거나 해제합니다",
            shortcut: formatKeyCombo(
                DEFAULT_KEY_COMBINATIONS[KeyboardShortcutId.TOGGLE_PIN_CURRENT_TAB],
            ),
            category: "Navigation",
            keywords: ["pin", "tab", "current", "고정"],
            action: () => {
                const activePath = selectedPathState.state;
                if (!activePath || !selectedPathState.list.includes(activePath)) return;

                setPinnedTabs((prev) =>
                    prev.includes(activePath)
                        ? prev.filter((path) => path !== activePath)
                        : [activePath, ...prev],
                );
            },
        },
        {
            id: "nav-default",
            label: "페이지 이동: Home",
            description: "메인 홈 페이지로 이동합니다",
            shortcut: "",
            category: "Navigation",
            keywords: ["home", "main", "default", "홈"],
            action: () => handlePushPath(DEFAULT),
        },
        {
            id: "nav-projects",
            label: "페이지 이동: Projects",
            description: "프로젝트 페이지로 이동합니다",
            shortcut: "",
            category: "Navigation",
            keywords: ["project", "work", "portfolio", "프로젝트"],
            action: () => handlePushPath(PROJECTS),
        },
        {
            id: "nav-resume",
            label: "페이지 이동: Resume",
            description: "이력서 페이지로 이동합니다",
            shortcut: "",
            category: "Navigation",
            keywords: ["resume", "cv", "이력서"],
            action: () => handlePushPath(RESUME),
        },
        {
            id: "nav-blog",
            label: "페이지 이동: Blog",
            description: "블로그 목록 페이지로 이동합니다",
            shortcut: "",
            category: "Navigation",
            keywords: ["blog", "post", "article", "블로그"],
            action: () => handlePushPath(BLOG),
        },
        {
            id: "nav-uses",
            label: "페이지 이동: Uses",
            description: "사용 도구/환경 페이지로 이동합니다",
            shortcut: "",
            category: "Navigation",
            keywords: ["uses", "stack", "tool", "도구"],
            action: () => handlePushPath(USES),
        },
        {
            id: "nav-guestbook",
            label: "페이지 이동: Guestbook",
            description: "방명록 페이지로 이동합니다",
            shortcut: "",
            category: "Navigation",
            keywords: ["guestbook", "message", "방명록"],
            action: () => handlePushPath(GUESTBOOK),
        },
        {
            id: "nav-contact",
            label: "페이지 이동: Contact",
            description: "연락처 페이지로 이동합니다",
            shortcut: "",
            category: "Navigation",
            keywords: ["contact", "email", "mail", "연락"],
            action: () => handlePushPath(CONTACT),
        },
        {
            id: "nav-git-control",
            label: "사이드 패널: Git Control",
            description: "Git Control 패널을 열거나 닫습니다",
            shortcut: formatKeyCombo(
                DEFAULT_KEY_COMBINATIONS[KeyboardShortcutId.TOGGLE_GIT_CONTROL],
            ),
            category: "Navigation",
            keywords: ["git", "commit", "repo", "깃"],
            action: () => {
                setSelectedNav((prev) =>
                    prev === NavType.GIT_CONTROL ? null : NavType.GIT_CONTROL,
                );
            },
        },
        {
            id: "nav-bookmarks",
            label: "사이드 패널: Bookmarks",
            description: "북마크 패널을 열거나 닫습니다",
            shortcut: formatKeyCombo(
                DEFAULT_KEY_COMBINATIONS[KeyboardShortcutId.TOGGLE_BOOKMARKS],
            ),
            category: "Navigation",
            keywords: ["bookmark", "favorite", "북마크"],
            action: () => {
                setSelectedNav((prev) =>
                    prev === NavType.BOOKMARKS ? null : NavType.BOOKMARKS,
                );
            },
        },
        {
            id: "nav-settings",
            label: "사이드 패널: Settings",
            description: "설정 패널을 열거나 닫습니다",
            shortcut: formatKeyCombo(
                DEFAULT_KEY_COMBINATIONS[KeyboardShortcutId.TOGGLE_SETTINGS],
            ),
            category: "Navigation",
            keywords: ["settings", "preferences", "설정"],
            action: () => {
                setSelectedNav((prev) =>
                    prev === NavType.SETTINGS ? null : NavType.SETTINGS,
                );
            },
        },
        ...Object.entries(THEME_LABELS).map(([mode, label]) => ({
            id: `theme-${mode}`,
            label,
            description: "앱 배경 테마를 즉시 전환합니다",
            shortcut: "",
            category: "Theme" as const,
            keywords: ["theme", "color", "appearance", "테마"],
            action: () => {
                setSelectedTheme((prev) => ({
                    ...prev,
                    mode: mode as Exclude<ThemeMode, ThemeMode.CUSTOM>,
                    isVisibleThemeDropdown: false,
                }));
            },
        })),
        ...Object.entries(LANGUAGE_LABELS).map(([lang, label]) => ({
            id: `lang-${lang}`,
            label,
            description: "사이트 표시 언어를 전환합니다",
            shortcut: "",
            category: "Language" as const,
            keywords: ["language", "locale", "i18n", "언어"],
            action: () => setLanguage(lang as "ko" | "en" | "ja"),
        })),
    ];

    // 검색 필터링 (label + description 모두 탐색)
    const getUsageScore = (commandId: string): number => {
        const usage = usageStats[commandId];
        if (!usage) return 0;

        const now = Date.now();
        const elapsedDays = (now - usage.lastUsedAt) / (1000 * 60 * 60 * 24);
        const recencyScore = Math.max(0, 40 - elapsedDays * 4);
        const frequencyScore = Math.min(usage.count * 6, 60);

        return frequencyScore + recencyScore;
    };

    const getQueryScore = (command: Command, q: string): number => {
        const label = command.label.toLowerCase();
        const description = command.description.toLowerCase();
        const category = command.category.toLowerCase();
        const keywords = command.keywords ?? [];

        let score = 0;
        if (label.startsWith(q)) score += 140;
        else if (label.includes(q)) score += 90;

        if (description.startsWith(q)) score += 40;
        else if (description.includes(q)) score += 25;

        if (category.includes(q)) score += 15;

        if (keywords.some((keyword) => keyword.toLowerCase().startsWith(q))) score += 35;
        else if (keywords.some((keyword) => keyword.toLowerCase().includes(q))) score += 20;

        score += getUsageScore(command.id);

        return score;
    };

    const filteredCommands = useMemo(() => {
        const q = searchQuery.trim().toLowerCase();

        const searched = commands.filter((cmd) => {
            if (!q) return true;
            return (
                cmd.label.toLowerCase().includes(q) ||
                cmd.description.toLowerCase().includes(q) ||
                cmd.category.toLowerCase().includes(q) ||
                (cmd.keywords ?? []).some((keyword) =>
                    keyword.toLowerCase().includes(q),
                )
            );
        });

        if (q) {
            const ranked = [...searched].sort(
                (a, b) => getQueryScore(b, q) - getQueryScore(a, q),
            );
            if (!showPinnedOnly) return ranked;
            const pinnedSet = new Set(pinnedCommandIds);
            return ranked.filter((command) => pinnedSet.has(command.id));
        }

        const byUsage = [...searched].sort(
            (a, b) => getUsageScore(b.id) - getUsageScore(a.id),
        );

        const pinned = pinnedCommandIds
            .map((id) => byUsage.find((cmd) => cmd.id === id))
            .filter((cmd): cmd is Command => Boolean(cmd));
        const pinnedIds = new Set(pinned.map((cmd) => cmd.id));

        const recent = recentCommandIds
            .map((id) => byUsage.find((cmd) => cmd.id === id))
            .filter((cmd): cmd is Command => cmd !== undefined)
            .filter((cmd) => !pinnedIds.has(cmd.id));

        const recentIds = new Set(recent.map((cmd) => cmd.id));
        const rest = byUsage.filter(
            (cmd) => !pinnedIds.has(cmd.id) && !recentIds.has(cmd.id),
        );

        if (showPinnedOnly) {
            return pinned;
        }

        return [...pinned, ...recent, ...rest];
    }, [commands, pinnedCommandIds, recentCommandIds, searchQuery, showPinnedOnly, usageStats]);

    const visibleRows = useMemo<CommandRow[]>(() => {
        const q = searchQuery.trim();
        const pinnedSet = new Set(pinnedCommandIds);
        const recentSet = new Set(recentCommandIds);
        const indexById = new Map(filteredCommands.map((command, index) => [command.id, index]));

        const rows: CommandRow[] = [];

        const pushCategorySections = (commandsByCategory: Command[]) => {
            CATEGORY_ORDER.forEach((category) => {
                const items = commandsByCategory.filter((command) => command.category === category);
                if (items.length === 0) return;
                rows.push({
                    type: "section",
                    id: `section-category-${category}`,
                    label: CATEGORY_LABELS[category],
                });
                rows.push(
                    ...items.map((command) => ({
                        type: "command" as const,
                        command,
                        index: indexById.get(command.id) ?? 0,
                    })),
                );
            });
        };

        if (q) {
            if (showPinnedOnly) {
                return filteredCommands.map((command, index) => ({
                    type: "command",
                    command,
                    index,
                }));
            }

            pushCategorySections(filteredCommands);
            return rows;
        }

        const pinned = filteredCommands.filter((command) => pinnedSet.has(command.id));
        const recent = filteredCommands.filter(
            (command) => !pinnedSet.has(command.id) && recentSet.has(command.id),
        );
        const all = filteredCommands.filter(
            (command) => !pinnedSet.has(command.id) && !recentSet.has(command.id),
        );
        const recommended = all
            .filter((command) => getUsageScore(command.id) > 0)
            .slice(0, MAX_RECOMMENDED_COMMANDS);
        const recommendedIds = new Set(recommended.map((command) => command.id));
        const allWithoutRecommended = all.filter((command) => !recommendedIds.has(command.id));

        if (pinned.length > 0) {
            rows.push({ type: "section", id: "section-pinned", label: "Pinned" });
            rows.push(
                ...pinned.map((command) => ({
                    type: "command" as const,
                    command,
                    index: indexById.get(command.id) ?? 0,
                })),
            );
        }

        if (!showPinnedOnly && recent.length > 0) {
            rows.push({ type: "section", id: "section-recent", label: "Recent" });
            rows.push(
                ...recent.map((command) => ({
                    type: "command" as const,
                    command,
                    index: indexById.get(command.id) ?? 0,
                })),
            );
        }

        if (!showPinnedOnly && recommended.length > 0) {
            rows.push({ type: "section", id: "section-recommended", label: "Recommended" });
            rows.push(
                ...recommended.map((command) => ({
                    type: "command" as const,
                    command,
                    index: indexById.get(command.id) ?? 0,
                })),
            );
        }

        if (!showPinnedOnly && allWithoutRecommended.length > 0) {
            rows.push({ type: "section", id: "section-all", label: "All Commands" });
            rows.push(
                ...allWithoutRecommended.map((command) => ({
                    type: "command" as const,
                    command,
                    index: indexById.get(command.id) ?? 0,
                })),
            );
        }

        return rows;
    }, [filteredCommands, pinnedCommandIds, recentCommandIds, searchQuery, showPinnedOnly]);

    useEffect(() => {
        if (filteredCommands.length === 0) {
            setSelectedIndex(0);
            return;
        }
        setSelectedIndex((prev) => Math.min(prev, filteredCommands.length - 1));
    }, [filteredCommands]);

    // 팔레트가 열릴 때 입력창 포커스
    useEffect(() => {
        if (isVisibleCommandPalette && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isVisibleCommandPalette]);

    // 키보드 네비게이션
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.altKey && e.key.toLowerCase() === "p") {
            e.preventDefault();
            setShowPinnedOnly((prev) => !prev);
            setSelectedIndex(0);
            return;
        }

        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
            e.preventDefault();
            const selectedCommand = filteredCommands[selectedIndex];
            if (!selectedCommand) return;
            togglePinnedCommand(selectedCommand.id);
            return;
        }

        if (e.key === "ArrowDown") {
            e.preventDefault();
            setSelectedIndex((prev) =>
                prev < filteredCommands.length - 1 ? prev + 1 : prev,
            );
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
        } else if (e.key === "Enter") {
            e.preventDefault();
            executeCommand(filteredCommands[selectedIndex]);
        } else if (e.key === "Escape") {
            e.preventDefault();
            closeCommandPalette();
        }
    };

    const executeCommand = (command: Command | undefined) => {
        if (command && command.action) {
            command.action();
            const now = Date.now();

            setUsageStats((prev) => {
                const current = prev[command.id];
                const next: CommandUsageStats = {
                    ...prev,
                    [command.id]: {
                        count: (current?.count ?? 0) + 1,
                        lastUsedAt: now,
                    },
                };
                try {
                    const nextStorage: CommandUsageStorage = {
                        version: COMMAND_USAGE_STORAGE_VERSION,
                        stats: next,
                    };
                    localStorage.setItem(
                        COMMAND_USAGE_STATS_STORAGE_KEY,
                        JSON.stringify(nextStorage),
                    );
                } catch {
                    // ignore storage errors
                }
                return next;
            });

            setRecentCommandIds((prev) => {
                const next = [command.id, ...prev.filter((id) => id !== command.id)].slice(
                    0,
                    MAX_RECENT_COMMANDS,
                );
                try {
                    localStorage.setItem(
                        RECENT_COMMANDS_STORAGE_KEY,
                        JSON.stringify(next),
                    );
                } catch {
                    // ignore storage errors
                }
                return next;
            });
        }
        closeCommandPalette();
    };

    const togglePinnedCommand = (commandId: string) => {
        setPinnedCommandIds((prev) => {
            const next = prev.includes(commandId)
                ? prev.filter((id) => id !== commandId)
                : [commandId, ...prev].slice(0, MAX_PINNED_COMMANDS);
            try {
                localStorage.setItem(
                    PINNED_COMMANDS_STORAGE_KEY,
                    JSON.stringify(next),
                );
            } catch {
                // ignore storage errors
            }
            return next;
        });
    };

    const closeCommandPalette = () => {
        setIsVisibleCommandPalette(false);
        setSearchQuery("");
        setSelectedIndex(0);
        setShowPinnedOnly(false);
    };

    if (!isVisibleCommandPalette) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 pt-12 sm:pt-16 md:pt-24 px-4"
            onClick={closeCommandPalette}
            role="dialog"
            aria-modal="true"
            aria-label="명령 팔레트"
        >
            <div
                ref={containerRef}
                className="w-full max-w-sm sm:max-w-lg md:max-w-2xl rounded-lg bg-[#252526] shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                {/* 검색 입력 */}
                <div className="border-b border-[#3e3e42] p-4">
                    <input
                        ref={inputRef}
                        type="text"
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setSelectedIndex(0);
                        }}
                        onKeyDown={handleKeyDown}
                        placeholder="명령을 입력하세요..."
                        className="w-full bg-transparent text-[#cccccc] outline-none placeholder:text-[#6e6e6e]"
                        role="combobox"
                        aria-expanded="true"
                        aria-controls="command-list"
                        aria-activedescendant={`command-${selectedIndex}`}
                    />
                    {showPinnedOnly && (
                        <div className="mt-2 inline-flex items-center rounded bg-amber-400/15 px-2 py-1 text-[11px] text-amber-200">
                            Pinned only mode
                        </div>
                    )}
                </div>

                {/* 명령 목록 */}
                <div
                    id="command-list"
                    className="max-h-96 overflow-y-auto"
                    role="listbox"
                >
                    {filteredCommands.length === 0 ? (
                        <div className="p-4 text-center text-[#6e6e6e]">
                            명령을 찾을 수 없습니다
                        </div>
                    ) : (
                        visibleRows.map((row) => {
                            if (row.type === "section") {
                                return (
                                    <div
                                        key={row.id}
                                        className="px-4 py-2 text-[10px] uppercase tracking-[0.08em] text-[#8f8f8f] bg-[#1f1f20] border-y border-[#343438]"
                                    >
                                        {row.label}
                                    </div>
                                );
                            }

                            const { command, index } = row;
                            const isSelected = index === selectedIndex;
                            const isPinned = pinnedCommandIds.includes(command.id);

                            return (
                                <button
                                    key={command.id}
                                    id={`command-${index}`}
                                    onClick={() => executeCommand(command)}
                                    onMouseEnter={() => setSelectedIndex(index)}
                                    className={`flex w-full items-center justify-between px-4 py-2.5 text-left transition-colors ${isSelected
                                        ? "bg-[#094771] text-white"
                                        : "text-[#cccccc] hover:bg-[#2a2d2e]"
                                        }`}
                                    role="option"
                                    aria-selected={isSelected}
                                >
                                    <span className="flex flex-col gap-0.5 min-w-0">
                                        <span className="text-sm flex items-center gap-2">
                                            <Highlight text={command.label} query={searchQuery} />
                                            <span className="rounded px-1.5 py-0.5 text-[10px] leading-none bg-white/10 text-white/65">
                                                {CATEGORY_LABELS[command.category]}
                                            </span>
                                        </span>
                                        <span className={`text-xs truncate ${isSelected ? "text-white/60" : "text-[#6e6e6e]"}`}>
                                            <Highlight text={command.description} query={searchQuery} />
                                        </span>
                                    </span>

                                    <span className="flex items-center gap-2 shrink-0 ml-4">
                                        <span
                                            role="button"
                                            tabIndex={-1}
                                            onClick={(event) => {
                                                event.preventDefault();
                                                event.stopPropagation();
                                                togglePinnedCommand(command.id);
                                            }}
                                            onKeyDown={(event) => {
                                                if (event.key !== "Enter" && event.key !== " ") return;
                                                event.preventDefault();
                                                event.stopPropagation();
                                                togglePinnedCommand(command.id);
                                            }}
                                            aria-label={isPinned ? "Unpin command" : "Pin command"}
                                            title={isPinned ? "고정 해제" : "명령 고정"}
                                            className={`cursor-pointer rounded px-1.5 py-0.5 text-[11px] transition-colors ${isPinned
                                                ? "text-amber-300 bg-amber-400/15"
                                                : "text-[#8a8a8a] hover:text-[#d1d1d1] hover:bg-white/10"
                                                }`}
                                        >
                                            {isPinned ? "★" : "☆"}
                                        </span>
                                        <span className="text-xs text-[#858585]">
                                            {command.shortcut || command.quickHint || ""}
                                        </span>
                                    </span>
                                </button>
                            );
                        })
                    )}
                </div>

                {/* 하단 정보 */}
                <div className="border-t border-[#3e3e42] px-4 py-2 text-xs text-[#858585]">
                    ↑↓로 이동 • Enter로 실행 • Ctrl/Cmd+K로 Pin • Alt+P로 Pinned 필터 • ESC로 닫기
                </div>
            </div>
        </div>
    );
};
