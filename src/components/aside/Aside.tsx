import { useContext, useEffect, useRef, useCallback } from "react";
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

export const Aside = () => {
    const { layoutState, setLayoutState } = useContext(LayoutContext);
    const { selectedNav, setSelectedNav } = useContext(NavigationContext);
    const { backgroundStyle, backgroundClass } = useThemeStyle();
    const asideRef = useRef<HTMLDivElement>(null);
    const handleMouseDown = useDragging({ targetRef: asideRef, type: "sidebar" });
    const isMobileSize = useCheckedMobileSize();
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
        // transition 복원
        if (sheetRef.current) {
            sheetRef.current.style.transition = "";
            sheetRef.current.style.transform = "";
        }
        if (delta > 80) {
            setSelectedNav(null);
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
                        "fixed left-0 right-0 bottom-12 z-50 flex flex-col",
                        "transition-transform duration-300 ease-in-out",
                        backgroundClass,
                        "border-t border-sub-gary/30",
                        "rounded-t-2xl",
                        selectedNav ? "translate-y-0" : "translate-y-full",
                    ].join(" ")}
                    style={{
                        maxHeight: "65dvh",
                        ...backgroundStyle,
                    }}
                >
                    {/* 핸들 바 — 드래그로 닫기 */}
                    <div
                        className="flex justify-center pt-3 pb-2 shrink-0 cursor-grab active:cursor-grabbing touch-none select-none"
                        onPointerDown={handleSheetDragStart}
                        onPointerMove={handleSheetDragMove}
                        onPointerUp={handleSheetDragEnd}
                        onPointerCancel={handleSheetDragEnd}
                    >
                        <div className="w-10 h-1 rounded-full bg-sub-gary/50" />
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

                {/* 하단 네비게이션 바 */}
                <nav
                    className={[
                        "fixed bottom-0 left-0 right-0 h-12 z-50",
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
                            onClick={() => handleClickNav(item.type)}
                            className={[
                                "flex flex-col items-center justify-center",
                                "h-full flex-1 gap-0.5",
                                "transition-colors",
                                selectedNav === item.type
                                    ? "text-primary"
                                    : "text-white/60 hover:text-white",
                            ].join(" ")}
                            aria-label={item.label}
                            aria-pressed={selectedNav === item.type}
                        >
                            <item.icon className="w-5 h-5" />
                            <span className="text-[10px] leading-none">{item.label}</span>
                        </button>
                    ))}
                </nav>
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
