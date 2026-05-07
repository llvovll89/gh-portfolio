import { CiKeyboard } from "react-icons/ci";
import { VscGithub, VscTerminal } from "react-icons/vsc";
import { SiVelog } from "react-icons/si";
import { NAV_ITEMS, NavType } from "../constants/Nav.type";
import { useContext, useEffect, useState } from "react";
import { KeyboardContext } from "../../../context/KeyboardState.context";
import { LayoutContext } from "../../../context/LayoutContext";
import { TerminalContext } from "../../../context/TerminalContext";
import { KeyboardInfo } from "../../keyboardInfo/KeyboardInfo";
import { useCheckedMobileSize } from "../../../hooks/useCheckedMobileSize";

const BOOKMARKS_STORAGE_KEY = "portfolio-bookmarks";
const BOOKMARKS_UPDATED_EVENT = "portfolio-bookmarks-updated";
const GIT_SUMMARY_UPDATED_EVENT = "portfolio-git-summary-updated";
const SETTINGS_BADGE_STORAGE_KEY = "portfolio-settings-has-updates";
const SETTINGS_UPDATED_EVENT = "portfolio-settings-updated";

interface NavbarProps {
    selectedNav: NavType | null;
    onClickNav: (navType: NavType) => void;
}

export const Navbar = ({ selectedNav, onClickNav }: NavbarProps) => {
    const { toggleKeyboardInfo, isVisibleKeyboardInfo } =
        useContext(KeyboardContext);
    const { setLayoutState } = useContext(LayoutContext);
    const { isTerminalVisible, setIsTerminalVisible } = useContext(TerminalContext);
    const isMobileSize = useCheckedMobileSize();
    const [bookmarkCount, setBookmarkCount] = useState(0);
    const [gitOpenCount, setGitOpenCount] = useState(0);
    const [hasSettingsUpdates, setHasSettingsUpdates] = useState(false);

    const COLLAPSED_HEIGHT = 32; // 터미널 헤더 바 높이
    const OPEN_HEIGHT = 220; // 터미널 열렸을 때 최소 높이

    const toggleTerminal = () => {
        if (!isTerminalVisible) {
            // 터미널이 숨겨져 있으면 표시하고 열기
            setIsTerminalVisible(true);
            setLayoutState((prev) => ({
                ...prev,
                resizeFooterHeight: OPEN_HEIGHT,
            }));
        } else {
            // 터미널이 표시되어 있으면 숨기기
            setIsTerminalVisible(false);
            setLayoutState((prev) => ({
                ...prev,
                resizeFooterHeight: COLLAPSED_HEIGHT,
            }));
        }
    };

    useEffect(() => {
        const updateBookmarkCount = () => {
            try {
                const stored = localStorage.getItem(BOOKMARKS_STORAGE_KEY);
                if (!stored) {
                    setBookmarkCount(0);
                    return;
                }
                const parsed = JSON.parse(stored);
                if (Array.isArray(parsed)) {
                    setBookmarkCount(parsed.length);
                } else {
                    setBookmarkCount(0);
                }
            } catch {
                setBookmarkCount(0);
            }
        };

        const handleStorage = (event: StorageEvent) => {
            if (event.key === BOOKMARKS_STORAGE_KEY) {
                updateBookmarkCount();
            }
            if (event.key === SETTINGS_BADGE_STORAGE_KEY) {
                setHasSettingsUpdates(event.newValue === "1");
            }
        };

        const handleGitSummary = (event: Event) => {
            const customEvent = event as CustomEvent<{ openCount?: number }>;
            const nextCount = customEvent.detail?.openCount;
            setGitOpenCount(typeof nextCount === "number" ? nextCount : 0);
        };

        const handleSettingsUpdated = (event: Event) => {
            const customEvent = event as CustomEvent<{ dirty?: boolean }>;
            const dirty = customEvent.detail?.dirty;
            if (typeof dirty === "boolean") {
                setHasSettingsUpdates(dirty);
                return;
            }
            setHasSettingsUpdates(true);
        };

        try {
            setHasSettingsUpdates(
                localStorage.getItem(SETTINGS_BADGE_STORAGE_KEY) === "1",
            );
        } catch {
            setHasSettingsUpdates(false);
        }

        updateBookmarkCount();
        window.addEventListener("storage", handleStorage);
        window.addEventListener(BOOKMARKS_UPDATED_EVENT, updateBookmarkCount);
        window.addEventListener(GIT_SUMMARY_UPDATED_EVENT, handleGitSummary);
        window.addEventListener(SETTINGS_UPDATED_EVENT, handleSettingsUpdated);

        return () => {
            window.removeEventListener("storage", handleStorage);
            window.removeEventListener(BOOKMARKS_UPDATED_EVENT, updateBookmarkCount);
            window.removeEventListener(GIT_SUMMARY_UPDATED_EVENT, handleGitSummary);
            window.removeEventListener(SETTINGS_UPDATED_EVENT, handleSettingsUpdated);
        };
    }, []);

    useEffect(() => {
        if (selectedNav !== NavType.SETTINGS) return;
        if (!hasSettingsUpdates) return;

        setHasSettingsUpdates(false);
        try {
            localStorage.setItem(SETTINGS_BADGE_STORAGE_KEY, "0");
        } catch {
            // ignore storage errors
        }
    }, [hasSettingsUpdates, selectedNav]);

    return (
        <nav className="relative w-10 flex flex-col items-center h-full z-10 border-r border-sub-gary/30 text-white select-none">
            {/* Main navigation items */}
            <div className="flex-1 flex flex-col w-full">
                {NAV_ITEMS.map((item) => (
                    <button
                        key={item.type}
                        onClick={() => onClickNav(item.type)}
                        title={
                            item.type === NavType.BOOKMARKS && bookmarkCount > 0
                                ? `${item.label} (${bookmarkCount})`
                                : item.type === NavType.GIT_CONTROL && gitOpenCount > 0
                                ? `${item.label} (${gitOpenCount})`
                                : item.label
                        }
                        className={`cursor-pointer py-2 px-1 w-full h-10 flex items-center justify-center transition-colors ${
                            selectedNav === item.type
                                ? "bg-sub-gary/20 text-primary"
                                : "text-white hover:bg-sub-gary/10"
                        }`}
                        aria-label={item.label}
                    >
                        <span className="relative inline-flex">
                            <item.icon className="w-5 h-5" />
                            {item.type === NavType.BOOKMARKS && bookmarkCount > 0 && (
                                <span
                                    aria-hidden="true"
                                    className={`absolute -top-1.5 -right-2 min-w-3.5 h-3.5 px-1 rounded-full text-[9px] font-bold leading-3.5 text-center ${selectedNav === NavType.BOOKMARKS ? "bg-primary text-white" : "bg-amber-400 text-black"}`}
                                >
                                    {bookmarkCount > 99 ? "99+" : bookmarkCount}
                                </span>
                            )}
                            {item.type === NavType.GIT_CONTROL && gitOpenCount > 0 && (
                                <span
                                    aria-hidden="true"
                                    className={`absolute -top-1.5 -right-2 min-w-3.5 h-3.5 px-1 rounded-full text-[9px] font-bold leading-3.5 text-center ${selectedNav === NavType.GIT_CONTROL ? "bg-primary text-white" : "bg-cyan-400 text-black"}`}
                                >
                                    {gitOpenCount > 99 ? "99+" : gitOpenCount}
                                </span>
                            )}
                            {item.type === NavType.SETTINGS && hasSettingsUpdates && (
                                <span
                                    aria-hidden="true"
                                    className={`absolute -top-1 -right-1.5 h-2.5 w-2.5 rounded-full ${selectedNav === NavType.SETTINGS ? "bg-primary" : "bg-orange-400"}`}
                                />
                            )}
                        </span>
                    </button>
                ))}
            </div>

            {/* Bottom section with social links and utilities */}
            <div className="flex flex-col w-full">
                {/* Terminal toggle button - desktop only */}
                {!isMobileSize && (
                <button
                    onClick={toggleTerminal}
                    className="cursor-pointer py-2 px-1 w-full h-10 flex items-center justify-center text-white hover:bg-sub-gary/10 transition-colors"
                    aria-label="터미널 토글"
                    title="터미널 열기/닫기"
                >
                    <VscTerminal className="w-5 h-5" />
                </button>
                )}

                {/* GitHub link */}
                <a
                    href="https://github.com/llvovll89"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="cursor-pointer py-2 px-1 w-full h-10 flex items-center justify-center text-white hover:bg-sub-gary/10 transition-colors"
                    aria-label="GitHub 프로필"
                    title="GitHub"
                >
                    <VscGithub className="w-5 h-5" />
                </a>

                {/* Velog link */}
                <a
                    href="https://velog.io/@llvovll89/posts"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="cursor-pointer py-2 px-1 w-full h-10 flex items-center justify-center text-white hover:bg-sub-gary/10 transition-colors"
                    aria-label="Velog 블로그"
                    title="Velog"
                >
                    <SiVelog className="w-4 h-4" />
                </a>

                {/* Keyboard shortcuts button */}
                <button
                    onClick={toggleKeyboardInfo}
                    className="focus:outline-none cursor-pointer py-2 px-1 w-full h-10 flex items-center justify-center text-white hover:bg-sub-gary/10 transition-colors"
                    aria-label="키보드 단축키 안내"
                    title="키보드 단축키"
                >
                    <CiKeyboard className="w-6 h-6" />
                </button>
            </div>

            {isVisibleKeyboardInfo && <KeyboardInfo />}
        </nav>
    );
};
