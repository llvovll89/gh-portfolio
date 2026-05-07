import { useContext, useEffect, useRef, useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { LayoutContext } from "../../context/LayoutContext";
import { NavigationContext } from "../../context/NavigationContext";
import { useThemeStyle } from "../../hooks/useThemeStyle";
import { useDragging } from "../../hooks/useDragging";
import { Navbar } from "./navbar/Navbar";
import { Folder } from "./contents/folder/Folder";
import { MobileFolderNav } from "./contents/folder/MobileFolderNav";
import { NavType, NAV_ITEMS } from "./constants/Nav.type";
import { Search } from "./contents/search/Search";
import { GitControl } from "./contents/gitControl/GitControl";
import { Bookmarks } from "./contents/bookmarks/Bookmarks";
import { Settings } from "./contents/settings/Settings";
import { useCheckedMobileSize } from "../../hooks/useCheckedMobileSize";
import { routesPath } from "../../routes/route";

const BOOKMARKS_STORAGE_KEY = "portfolio-bookmarks";
const BOOKMARKS_UPDATED_EVENT = "portfolio-bookmarks-updated";
const GIT_SUMMARY_UPDATED_EVENT = "portfolio-git-summary-updated";
const SETTINGS_BADGE_STORAGE_KEY = "portfolio-settings-has-updates";
const SETTINGS_UPDATED_EVENT = "portfolio-settings-updated";
const SEARCH_FOCUS_EVENT = "portfolio-search-focus";
const GIT_ACTIVITY_OPEN_EVENT = "portfolio-git-open-activity";
const MOBILE_LONG_PRESS_MS = 450;
const QUICK_ACTION_HAPTIC_PATTERN = 12;

export const Aside = () => {
    const { layoutState, setLayoutState } = useContext(LayoutContext);
    const { selectedNav, setSelectedNav, selectedPathState } = useContext(NavigationContext);
    const { backgroundStyle, backgroundClass } = useThemeStyle();
    const asideRef = useRef<HTMLDivElement>(null);
    const handleMouseDown = useDragging({ targetRef: asideRef, type: "sidebar" });
    const isMobileSize = useCheckedMobileSize();
    const { t } = useTranslation();
    const sheetRef = useRef<HTMLDivElement>(null);
    const dragState = useRef({ startY: 0, currentY: 0, dragging: false });
    const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const longPressHandledRef = useRef(false);
    const pressPulseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const quickActionPulseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const [bookmarkCount, setBookmarkCount] = useState(0);
    const [gitOpenCount, setGitOpenCount] = useState(0);
    const [hasSettingsUpdates, setHasSettingsUpdates] = useState(false);
    const [quickActionNav, setQuickActionNav] = useState<NavType | null>(null);
    const [pressedNav, setPressedNav] = useState<NavType | null>(null);
    const [quickActionPulseKey, setQuickActionPulseKey] = useState<string | null>(null);

    useEffect(() => {
        const updateBookmarkCount = () => {
            try {
                const stored = localStorage.getItem(BOOKMARKS_STORAGE_KEY);
                if (!stored) {
                    setBookmarkCount(0);
                    return;
                }
                const parsed = JSON.parse(stored);
                setBookmarkCount(Array.isArray(parsed) ? parsed.length : 0);
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

        updateBookmarkCount();
        try {
            setHasSettingsUpdates(
                localStorage.getItem(SETTINGS_BADGE_STORAGE_KEY) === "1",
            );
        } catch {
            setHasSettingsUpdates(false);
        }

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

    const handleSheetDragStart = useCallback((e: React.PointerEvent) => {
        dragState.current = { startY: e.clientY, currentY: 0, dragging: true };
        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
        // 드래그 중 transition 제거 (즉각 반응)
        if (sheetRef.current) {
            sheetRef.current.style.transition = "none";
        }
    }, []);

    const handleSheetDragMove = useCallback((e: React.PointerEvent) => {
        if (!dragState.current.dragging) return;
        const delta = Math.max(0, e.clientY - dragState.current.startY);
        dragState.current.currentY = delta;
        if (sheetRef.current) {
            sheetRef.current.style.transform = `translateY(${delta}px)`;
        }
    }, []);

    const handleSheetDragEnd = useCallback(() => {
        if (!dragState.current.dragging) return;
        dragState.current.dragging = false;
        const delta = dragState.current.currentY;

        if (!sheetRef.current) return;

        if (delta > 80) {
            // 현재 위치에서 아래로 완전히 내려가며 닫기
            sheetRef.current.style.transition = "transform 300ms ease-in-out";
            sheetRef.current.style.transform = "translateY(100%)";
            setTimeout(() => {
                setSelectedNav(null);
                if (sheetRef.current) {
                    sheetRef.current.style.transition = "";
                    sheetRef.current.style.transform = "";
                }
            }, 300);
        } else {
            // 스냅백
            sheetRef.current.style.transition = "transform 300ms ease-in-out";
            sheetRef.current.style.transform = "translateY(0)";
            setTimeout(() => {
                if (sheetRef.current) {
                    sheetRef.current.style.transition = "";
                    sheetRef.current.style.transform = "";
                }
            }, 300);
        }
    }, [setSelectedNav]);

    const handleClickNav = (nav: NavType) => {
        if (selectedNav === nav) {
            setSelectedNav(null);
        } else {
            setSelectedNav(nav);
        }
    };

    const clearLongPressTimer = () => {
        if (!longPressTimerRef.current) return;
        clearTimeout(longPressTimerRef.current);
        longPressTimerRef.current = null;
    };

    const handleMobileNavPointerDown = (nav: NavType) => {
        longPressHandledRef.current = false;
        clearLongPressTimer();
        if (pressPulseTimerRef.current) {
            clearTimeout(pressPulseTimerRef.current);
        }
        setPressedNav(nav);
        pressPulseTimerRef.current = setTimeout(() => {
            setPressedNav(null);
            pressPulseTimerRef.current = null;
        }, 240);

        longPressTimerRef.current = setTimeout(() => {
            longPressHandledRef.current = true;
            if (typeof navigator !== "undefined" && "vibrate" in navigator) {
                navigator.vibrate(QUICK_ACTION_HAPTIC_PATTERN);
            }
            setQuickActionNav(nav);
        }, MOBILE_LONG_PRESS_MS);
    };

    const handleMobileNavPointerUp = () => {
        clearLongPressTimer();
    };

    useEffect(() => {
        return () => {
            if (pressPulseTimerRef.current) {
                clearTimeout(pressPulseTimerRef.current);
            }
            if (quickActionPulseTimerRef.current) {
                clearTimeout(quickActionPulseTimerRef.current);
            }
        };
    }, []);

    const handleMobileNavClick = (nav: NavType) => {
        if (longPressHandledRef.current) {
            longPressHandledRef.current = false;
            return;
        }
        handleClickNav(nav);
    };

    const handleQuickActionToggle = () => {
        if (!quickActionNav) return;
        handleClickNav(quickActionNav);
        setQuickActionNav(null);
    };

    const triggerQuickActionPulse = (key: string) => {
        if (quickActionPulseTimerRef.current) {
            clearTimeout(quickActionPulseTimerRef.current);
        }
        setQuickActionPulseKey(key);
        quickActionPulseTimerRef.current = setTimeout(() => {
            setQuickActionPulseKey(null);
            quickActionPulseTimerRef.current = null;
        }, 220);
    };

    const addCurrentPathToBookmarks = () => {
        const currentPath = selectedPathState.state;
        if (!currentPath) return;

        try {
            const stored = localStorage.getItem(BOOKMARKS_STORAGE_KEY);
            const currentBookmarks = Array.isArray(stored ? JSON.parse(stored) : [])
                ? (stored ? JSON.parse(stored) : [])
                : [];

            const exists = currentBookmarks.some(
                (bookmark: { path?: string }) => bookmark.path === currentPath,
            );
            if (exists) {
                setSelectedNav(NavType.BOOKMARKS);
                setQuickActionNav(null);
                return;
            }

            const matchedRoute = routesPath.find((route) => route.path === currentPath);
            const routeName = matchedRoute ? t(matchedRoute.name) : currentPath;

            const nextBookmarks = [
                ...currentBookmarks,
                {
                    id: Date.now().toString(),
                    path: currentPath,
                    name: routeName,
                    addedAt: Date.now(),
                },
            ];

            localStorage.setItem(BOOKMARKS_STORAGE_KEY, JSON.stringify(nextBookmarks));
            window.dispatchEvent(new Event(BOOKMARKS_UPDATED_EVENT));
            setSelectedNav(NavType.BOOKMARKS);
            setQuickActionNav(null);
        } catch {
            // ignore storage errors
        }
    };

    const openSearchAndFocus = () => {
        setSelectedNav(NavType.SEARCH);
        setQuickActionNav(null);
        requestAnimationFrame(() => {
            window.dispatchEvent(new Event(SEARCH_FOCUS_EVENT));
        });
    };

    const openGitWithActivity = () => {
        setSelectedNav(NavType.GIT_CONTROL);
        setQuickActionNav(null);
        requestAnimationFrame(() => {
            window.dispatchEvent(new Event(GIT_ACTIVITY_OPEN_EVENT));
        });
    };

    const quickActionTitle =
        quickActionNav && NAV_ITEMS.find((item) => item.type === quickActionNav)
            ? t(NAV_ITEMS.find((item) => item.type === quickActionNav)!.labelKey)
            : "";

    const NAVBAR_WIDTH = 40;
    const CONTENT_WIDTH = 210;

    const isMobileFolderNav = isMobileSize && selectedNav === NavType.FOLDER;

    useEffect(() => {
        if (isMobileSize) {
            setLayoutState((prev) => ({
                ...prev,
                resizeSidebarWidth: 0,
            }));
            return;
        }
        setLayoutState((prev) => ({
            ...prev,
            resizeSidebarWidth:
                selectedNav && !isMobileFolderNav
                    ? NAVBAR_WIDTH + CONTENT_WIDTH
                    : NAVBAR_WIDTH,
        }));
    }, [selectedNav, isMobileSize]);

    // ── 모바일: 하단 네비 + 바텀시트 ──────────────────────────────
    if (isMobileSize) {
        return (
            <>
                {/* 바텀시트 backdrop */}
                <div
                    aria-hidden="true"
                    className={[
                        "fixed inset-0 bg-black/50 z-40",
                        "transition-opacity duration-300",
                        selectedNav ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none",
                    ].join(" ")}
                    onClick={() => setSelectedNav(null)}
                />

                {/* 바텀시트 패널 */}
                <div
                    ref={sheetRef}
                    className={[
                        "fixed left-0 right-0 bottom-18 z-50 flex flex-col",
                        "transition-transform duration-300 ease-in-out",
                        backgroundClass,
                        "border-t border-sub-gary/30",
                        "rounded-t-2xl",
                        selectedNav ? "translate-y-0" : "translate-y-[200%]",
                    ].join(" ")}
                    style={{
                        maxHeight: "65dvh",
                        minHeight: "30dvh",
                        ...backgroundStyle,
                    }}
                >
                    {/* 핸들 바 — 열린 상태에서만 표시 */}
                    {selectedNav && (
                        <div
                            className="flex justify-center pt-3 pb-2 shrink-0 cursor-grab active:cursor-grabbing touch-none select-none"
                            onPointerDown={handleSheetDragStart}
                            onPointerMove={handleSheetDragMove}
                            onPointerUp={handleSheetDragEnd}
                            onPointerCancel={handleSheetDragEnd}
                        >
                            <div className="w-10 h-1 rounded-full bg-sub-gary/50" />
                        </div>
                    )}

                    {/* 콘텐츠 */}
                    <div className="flex-1 overflow-y-auto overflow-x-hidden">
                        {selectedNav === NavType.FOLDER && <Folder />}
                        {selectedNav === NavType.GIT_CONTROL && <GitControl />}
                        {selectedNav === NavType.SEARCH && <Search />}
                        {selectedNav === NavType.BOOKMARKS && <Bookmarks />}
                        {selectedNav === NavType.SETTINGS && <Settings />}
                    </div>
                </div>

                {/* 하단 네비게이션 바 */}
                <nav
                    className={[
                        "fixed bottom-4 left-0 right-0 h-14 z-50 w-[95%] mx-auto rounded-full flex items-center justify-around",
                        "flex items-center justify-around",
                        "border-t border-sub-gary/30",
                        backgroundClass,
                    ].join(" ")}
                    style={backgroundStyle}
                    aria-label="모바일 하단 네비게이션"
                >
                    {NAV_ITEMS.map((item) => (
                        <button
                            key={item.type}
                            onClick={() => handleMobileNavClick(item.type)}
                            onPointerDown={() => handleMobileNavPointerDown(item.type)}
                            onPointerUp={handleMobileNavPointerUp}
                            onPointerLeave={handleMobileNavPointerUp}
                            onPointerCancel={handleMobileNavPointerUp}
                            className={[
                                "flex flex-col items-center justify-center",
                                "h-full flex-1 gap-1",
                                "transition-colors",
                                selectedNav === item.type
                                    ? "text-primary"
                                    : "text-white/60 hover:text-white",
                            ].join(" ")}
                            aria-label={t(item.labelKey)}
                            aria-pressed={selectedNav === item.type}
                        >
                            <span className="relative inline-flex">
                                <item.icon
                                    className={`w-5 h-5 ${pressedNav === item.type ? "animate-[nav-press-pulse_0.24s_ease-out]" : ""}`}
                                />
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
                            <span className="text-[11px] leading-none">{t(item.labelKey)}</span>
                        </button>
                    ))}
                </nav>

                {quickActionNav && (
                    <>
                        <div
                            className="fixed inset-0 z-55"
                            onClick={() => setQuickActionNav(null)}
                            aria-hidden="true"
                        />
                        <section
                            className="fixed bottom-20 left-1/2 -translate-x-1/2 z-60 min-w-52 rounded-2xl border border-white/10 bg-[#1f1f24]/95 backdrop-blur-md shadow-2xl p-2 animate-[fadeIn_0.18s_ease-out]"
                            role="dialog"
                            aria-label="모바일 퀵 액션"
                        >
                            <div className="px-2 py-1.5 text-[11px] text-white/60 border-b border-white/10 mb-1">
                                {quickActionTitle} Quick Action
                            </div>
                            <button
                                onClick={() => {
                                    triggerQuickActionPulse("toggle");
                                    handleQuickActionToggle();
                                }}
                                className={`w-full text-left px-2 py-2 rounded-lg text-xs text-white hover:bg-white/10 transition-colors ${quickActionPulseKey === "toggle" ? "animate-[quick-action-pulse_0.22s_ease-out]" : ""}`}
                            >
                                {selectedNav === quickActionNav ? "패널 닫기" : "패널 열기"}
                            </button>
                            <button
                                onClick={() => {
                                    triggerQuickActionPulse("close-all");
                                    setSelectedNav(null);
                                    setQuickActionNav(null);
                                }}
                                className={`w-full text-left px-2 py-2 rounded-lg text-xs text-white/80 hover:bg-white/10 transition-colors ${quickActionPulseKey === "close-all" ? "animate-[quick-action-pulse_0.22s_ease-out]" : ""}`}
                            >
                                모든 패널 닫기
                            </button>
                            {quickActionNav === NavType.SEARCH && (
                                <button
                                    onClick={() => {
                                        triggerQuickActionPulse("search-focus");
                                        openSearchAndFocus();
                                    }}
                                    className={`w-full text-left px-2 py-2 rounded-lg text-xs text-white/90 hover:bg-white/10 transition-colors ${quickActionPulseKey === "search-focus" ? "animate-[quick-action-pulse_0.22s_ease-out]" : ""}`}
                                >
                                    검색창 포커스
                                </button>
                            )}
                            {quickActionNav === NavType.GIT_CONTROL && (
                                <button
                                    onClick={() => {
                                        triggerQuickActionPulse("git-activity");
                                        openGitWithActivity();
                                    }}
                                    className={`w-full text-left px-2 py-2 rounded-lg text-xs text-white/90 hover:bg-white/10 transition-colors ${quickActionPulseKey === "git-activity" ? "animate-[quick-action-pulse_0.22s_ease-out]" : ""}`}
                                >
                                    Activity 바로 열기
                                </button>
                            )}
                            {quickActionNav === NavType.BOOKMARKS && (
                                <button
                                    onClick={() => {
                                        triggerQuickActionPulse("bookmark-add");
                                        addCurrentPathToBookmarks();
                                    }}
                                    className={`w-full text-left px-2 py-2 rounded-lg text-xs text-white/90 hover:bg-white/10 transition-colors ${quickActionPulseKey === "bookmark-add" ? "animate-[quick-action-pulse_0.22s_ease-out]" : ""}`}
                                >
                                    현재 페이지 북마크 추가
                                </button>
                            )}
                        </section>
                    </>
                )}
            </>
        );
    }

    // ── 데스크톱: 기존 사이드바 ───────────────────────────────────
    return (
        <>
        {/* 모바일: 사이드바 열렸을 때 backdrop - FOLDER는 하단 탭으로 대체하므로 제외 */}
        {isMobileSize && selectedNav && !isMobileFolderNav && (
            <div
                aria-hidden="true"
                className="fixed inset-0 bg-black/50 z-10"
                onClick={() => setSelectedNav(null)}
            />
        )}

        {/* 모바일 FOLDER: 하단 고정 탭 네비 */}
        {isMobileFolderNav && <MobileFolderNav />}
        <aside
            id="main-navigation"
            role="navigation"
            aria-label="Main navigation"
            tabIndex={-1}
            ref={asideRef}
            style={{
                width: layoutState.resizeSidebarWidth,
                ...backgroundStyle,
            }}
            className={`translate-x-0 absolute left-0 top-0 h-dvh transition-transform ease-in-out ${backgroundClass} flex z-20`}
        >
            <Navbar selectedNav={selectedNav} onClickNav={handleClickNav} />

            {selectedNav && !isMobileFolderNav && (
                <div className="flex-1 overflow-hidden">
                    {selectedNav === NavType.FOLDER && <Folder />}
                    {selectedNav === NavType.GIT_CONTROL && <GitControl />}
                    {selectedNav === NavType.SEARCH && <Search />}
                    {selectedNav === NavType.BOOKMARKS && <Bookmarks />}
                    {selectedNav === NavType.SETTINGS && <Settings />}
                </div>
            )}

            {selectedNav && !isMobileFolderNav && (
                <div
                    role="separator"
                    aria-label="사이드바 너비 조절"
                    aria-orientation="vertical"
                    className={[
                        "absolute top-0 right-0 z-10 h-full",
                        "w-5 md:w-2",
                        "bg-linear-to-l from-slate-900/10 to-transparent",
                        "active:from-primary/20",
                        "transition-colors",
                        "touch-none select-none",
                        "cursor-ew-resize",
                        "flex items-center justify-center",
                    ].join(" ")}
                    style={{
                        WebkitTapHighlightColor: "transparent",
                        touchAction: "none",
                    }}
                    onPointerDown={handleMouseDown}
                    onMouseDown={handleMouseDown}
                    onTouchStart={handleMouseDown}
                >
                    {/* grip dots */}
                    <div className="flex flex-col gap-1.5 opacity-70">
                        <span className="block h-1 w-1 rounded-full bg-slate-400" />
                        <span className="block h-1 w-1 rounded-full bg-slate-400" />
                        <span className="block h-1 w-1 rounded-full bg-slate-400" />
                    </div>
                </div>
            )}
        </aside>
        </>
    );
};
