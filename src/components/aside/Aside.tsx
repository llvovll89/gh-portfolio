import { useContext, useEffect, useRef, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { LayoutContext } from "../../context/LayoutContext";
import { NavigationContext } from "../../context/NavigationContext";
import { useThemeStyle } from "../../hooks/useThemeStyle";
import { useDragging } from "../../hooks/useDragging";
import { Navbar } from "./navbar/Navbar";
import { Folder } from "./contents/folder/Folder";
import { NavType, NAV_ITEMS } from "./constants/Nav.type";
import { Search } from "./contents/search/Search";
import { GitControl } from "./contents/gitControl/GitControl";
import { Bookmarks } from "./contents/bookmarks/Bookmarks";
import { Settings } from "./contents/settings/Settings";
import { useCheckedMobileSize } from "../../hooks/useCheckedMobileSize";
import { BLOG, CONTACT, DEFAULT, PROJECTS, RESUME } from "../../routes/route";
import { useHandlePushPath } from "../../hooks/useHandlePushPath";
import { LuBookOpen, LuFolderKanban, LuHouse, LuMail, LuMenu, LuScrollText } from "react-icons/lu";

const MOBILE_PRIMARY_NAV = [
    { path: DEFAULT, labelKey: "routes.default", Icon: LuHouse },
    { path: PROJECTS, labelKey: "routes.projects", Icon: LuFolderKanban },
    { path: BLOG, labelKey: "routes.blog", Icon: LuBookOpen },
    { path: RESUME, labelKey: "routes.resume", Icon: LuScrollText },
    { path: CONTACT, labelKey: "routes.contact", Icon: LuMail },
] as const;

export const Aside = () => {
    const { layoutState, setLayoutState } = useContext(LayoutContext);
    const { selectedNav, setSelectedNav, selectedPathState } = useContext(NavigationContext);
    const { backgroundStyle, backgroundClass } = useThemeStyle();
    const asideRef = useRef<HTMLDivElement>(null);
    const handleMouseDown = useDragging({ targetRef: asideRef, type: "sidebar" });
    const isMobileSize = useCheckedMobileSize();
    const { t } = useTranslation();
    const handlePushPath = useHandlePushPath();
    const sheetRef = useRef<HTMLDivElement>(null);
    const dragState = useRef({ startY: 0, currentY: 0, dragging: false });
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

    const NAVBAR_WIDTH = 40;
    const CONTENT_WIDTH = 210;

    useEffect(() => {
        if (!isMobileSize) return;
        document.body.style.overflow = selectedNav ? "hidden" : "";
        return () => {
            document.body.style.overflow = "";
        };
    }, [selectedNav, isMobileSize]);

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
            resizeSidebarWidth: selectedNav ? NAVBAR_WIDTH + CONTENT_WIDTH : NAVBAR_WIDTH,
        }));
    }, [selectedNav, isMobileSize, setLayoutState]);

    useEffect(() => {
        if (isMobileSize) {
            setSelectedNav(null);
        }
    }, [isMobileSize, setSelectedNav]);

    // ── 모바일: 하단 네비 + 바텀시트 ──────────────────────────────
    if (isMobileSize) {
        return (
            <>
                {selectedNav && (
                    <>
                        <div
                            aria-hidden="true"
                            className="fixed inset-0 z-40 bg-black/50"
                            onClick={() => setSelectedNav(null)}
                        />

                        <div
                            ref={sheetRef}
                            className={[
                                "fixed bottom-18 left-0 right-0 z-50 flex flex-col",
                                "transition-transform duration-300 ease-in-out",
                                backgroundClass,
                                "rounded-t-2xl border-t border-sub-gary/30",
                            ].join(" ")}
                            style={{
                                maxHeight: "65dvh",
                                minHeight: "30dvh",
                                ...backgroundStyle,
                            }}
                        >
                    {/* 열린 상태에서만 표시하는 핸들 바 */}
                        <div
                            className="flex justify-center pt-3 pb-2 shrink-0 cursor-grab active:cursor-grabbing touch-none select-none"
                            onPointerDown={handleSheetDragStart}
                            onPointerMove={handleSheetDragMove}
                            onPointerUp={handleSheetDragEnd}
                            onPointerCancel={handleSheetDragEnd}
                        >
                            <div className="w-10 h-1 rounded-full bg-sub-gary/50" />
                        </div>

                        <div className="flex gap-1 overflow-x-auto border-b border-sub-gary/20 px-3 pb-2 scrolls">
                            {NAV_ITEMS.map((item) => (
                                <button
                                    key={item.type}
                                    type="button"
                                    onClick={() => setSelectedNav(item.type)}
                                    className={`min-h-10 shrink-0 rounded-lg px-3 text-xs font-medium transition-colors ${
                                        selectedNav === item.type
                                            ? "bg-primary/15 text-primary"
                                            : "text-white/60 hover:bg-white/5 hover:text-white"
                                    }`}
                                >
                                    {t(item.labelKey)}
                                </button>
                            ))}
                        </div>

                    {/* 콘텐츠 */}
                    <div className="flex-1 overflow-y-auto overflow-x-hidden">
                        {selectedNav === NavType.FOLDER && <Folder />}
                        {selectedNav === NavType.GIT_CONTROL && <GitControl />}
                        {selectedNav === NavType.SEARCH && <Search />}
                        {selectedNav === NavType.BOOKMARKS && <Bookmarks />}
                        {selectedNav === NavType.SETTINGS && <Settings />}
                    </div>
                        </div>
                    </>
                )}

                {/* 하단 네비게이션 바 */}
                <nav
                    className={[
                        "fixed bottom-4 left-0 right-0 z-50 mx-auto grid h-14 w-[95%] grid-cols-6 items-center rounded-2xl",
                        "border-t border-sub-gary/30",
                        backgroundClass,
                    ].join(" ")}
                    style={backgroundStyle}
                    aria-label="모바일 하단 네비게이션"
                >
                    {MOBILE_PRIMARY_NAV.map((item) => (
                        <button
                            type="button"
                            key={item.path}
                            onClick={() => {
                                setSelectedNav(null);
                                handlePushPath(item.path);
                            }}
                            className={[
                                "flex min-w-0 flex-col items-center justify-center",
                                "min-h-11 h-full flex-1 gap-1",
                                "transition-colors",
                                selectedPathState.state === item.path ||
                                (item.path === BLOG && selectedPathState.state.startsWith("/blog/"))
                                    ? "text-primary"
                                    : "text-white/60 hover:text-white",
                            ].join(" ")}
                            aria-label={t(item.labelKey)}
                            aria-current={
                                selectedPathState.state === item.path ||
                                (item.path === BLOG && selectedPathState.state.startsWith("/blog/"))
                                    ? "page"
                                    : undefined
                            }
                        >
                            <item.Icon className="h-5 w-5" />
                            <span className="text-[10px] leading-none">{t(item.labelKey)}</span>
                        </button>
                    ))}
                    <button
                        type="button"
                        onClick={() => setSelectedNav((current) => current ?? NavType.FOLDER)}
                        className={`flex min-h-11 h-full min-w-0 flex-col items-center justify-center gap-1 transition-colors ${
                            selectedNav ? "text-primary" : "text-white/60 hover:text-white"
                        }`}
                        aria-label={t("routes.tools")}
                        aria-expanded={Boolean(selectedNav)}
                    >
                        <LuMenu className="h-5 w-5" />
                        <span className="text-[10px] leading-none">{t("routes.tools")}</span>
                    </button>
                </nav>

            </>
        );
    }

    // ── 데스크톱: 기존 사이드바 ───────────────────────────────────
    return (
        <>
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

            {selectedNav && (
                <div className="flex-1 overflow-hidden">
                    {selectedNav === NavType.FOLDER && <Folder />}
                    {selectedNav === NavType.GIT_CONTROL && <GitControl />}
                    {selectedNav === NavType.SEARCH && <Search />}
                    {selectedNav === NavType.BOOKMARKS && <Bookmarks />}
                    {selectedNav === NavType.SETTINGS && <Settings />}
                </div>
            )}

            {selectedNav && (
                <div
                    role="separator"
                    aria-label="사이드바 너비 조절"
                    aria-orientation="vertical"
                    className={[
                        "group absolute top-0 right-0 z-10 h-full",
                        "w-5 md:w-2",
                        "bg-linear-to-l from-slate-900/10 to-transparent",
                        "hover:from-primary/15 active:from-primary/25",
                        "transition-colors duration-200",
                        "touch-none select-none",
                        "cursor-col-resize",
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
                    <div className="flex flex-col gap-1.5 opacity-40 group-hover:opacity-90 transition-opacity duration-200">
                        <span className="block h-1 w-1 rounded-full bg-slate-300 group-hover:bg-primary transition-colors duration-200" />
                        <span className="block h-1 w-1 rounded-full bg-slate-300 group-hover:bg-primary transition-colors duration-200" />
                        <span className="block h-1 w-1 rounded-full bg-slate-300 group-hover:bg-primary transition-colors duration-200" />
                    </div>
                </div>
            )}
        </aside>
        </>
    );
};
