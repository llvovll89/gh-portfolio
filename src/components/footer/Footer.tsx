import { useContext, useEffect, useRef, useState } from "react";
import { GlobalStateContext } from "../../context/GlobalState.context";
import { useDragging } from "../../hooks/useDragging";
import { Cli } from "./cli/Cli";
import { useCheckedMobileSize } from "../../hooks/useCheckedMobileSize";
import { ThemeMode } from "../../context/constatns/Theme.type";
import { LAYOUT_CONSTANTS } from "../../constants/layout";
import { FooterTabs } from "./tabs/FooterTabs";
import { ConsoleTab } from "./tabs/ConsoleTab";
import type { FooterTabType } from "./types";
import { KeyboardContext } from "../../context/KeyboardState.context";

const COLLAPSED_HEIGHT = 32; // 헤더 바 높이(h-8)
const OPEN_HEIGHT = 220; // 열렸을 때 최소 높이

export const Bottom = () => {
    const { layoutState, selectedTheme, setLayoutState } =
        useContext(GlobalStateContext);
    const { submitCliCommand } = useContext(KeyboardContext);

    const footerRef = useRef<HTMLDivElement>(null);
    const handleMouseDown = useDragging({ targetRef: footerRef, type: "footer" });

    const isOpen = layoutState.resizeFooterHeight > COLLAPSED_HEIGHT;
    const isMobileSize = useCheckedMobileSize();

    // 커스텀 테마 적용
    const backgroundStyle = selectedTheme.mode === ThemeMode.CUSTOM && selectedTheme.customColor
        ? { backgroundColor: selectedTheme.customColor }
        : {};

    const backgroundClass = selectedTheme.mode === ThemeMode.CUSTOM
        ? ""
        : selectedTheme.mode;

    const closeFooter = () => {
        setLayoutState((prev) => ({
            ...prev,
            resizeFooterHeight: COLLAPSED_HEIGHT,
        }));
    };

    const openFooter = () => {
        setLayoutState((prev) => ({
            ...prev,
            resizeFooterHeight: Math.max(prev.resizeFooterHeight, OPEN_HEIGHT),
        }));
    };

    // 탭 상태 관리
    const [activeTab, setActiveTab] = useState<FooterTabType>(
        () => (localStorage.getItem("footerActiveTab") as FooterTabType) || "terminal"
    );

    // CLI 명령 실행 시 콘솔 탭으로 자동 전환 + 패널 열기
    useEffect(() => {
        if (submitCliCommand.value && submitCliCommand.value.trim() !== "") {
            setActiveTab("console");
            openFooter();
        }
    }, [submitCliCommand.value]);

    // activeTab 변경 시 localStorage에 저장
    const handleTabChange = (tab: FooterTabType) => {
        setActiveTab(tab);
        localStorage.setItem("footerActiveTab", tab);
    };

    return (
        <footer
            ref={footerRef}
            className={`absolute z-10 bottom-0 right-0 border-t border-sub-gary/30 ${backgroundClass} overflow-hidden flex flex-col`}
            style={{
                width: `calc(100% - ${isMobileSize ? LAYOUT_CONSTANTS.MOBILE_SIDEBAR_WIDTH : layoutState.resizeSidebarWidth}px)`,
                height: layoutState.resizeFooterHeight || COLLAPSED_HEIGHT,
                ...backgroundStyle,
            }}
        >
            {/* 탭 헤더 */}
            <header
                className="select-none text-sub-gary text-xs w-full h-8 flex items-center justify-between px-0 shrink-0"
                onDoubleClick={() => (isOpen ? closeFooter() : openFooter())}
                title="더블클릭 시 터미널 열기/닫기"
            >
                <FooterTabs activeTab={activeTab} onTabChange={handleTabChange} />
                <button
                    type="button"
                    onClick={() => (isOpen ? closeFooter() : openFooter())}
                    className="px-3 h-full text-white/70 text-[1.25rem] hover:bg-white/5"
                    aria-label="터미널 열기/닫기"
                >
                    {isOpen ? "▾" : "▴"}
                </button>
            </header>

            {/* 콘텐츠 영역 */}
            {isOpen && (
                <div className="flex-1 overflow-hidden">
                    {activeTab === "terminal" && (
                        <div
                            id="footer-tabpanel-terminal"
                            role="tabpanel"
                            aria-labelledby="footer-tab-terminal"
                            tabIndex={0}
                            className="h-full"
                        >
                            <Cli />
                        </div>
                    )}
                    {activeTab === "console" && (
                        <div
                            id="footer-tabpanel-console"
                            role="tabpanel"
                            aria-labelledby="footer-tab-console"
                            tabIndex={0}
                            className="h-full"
                        >
                            <ConsoleTab />
                        </div>
                    )}
                </div>
            )}

            {/* 리사이즈 핸들도 열렸을 때만 */}
            {isOpen && (
                <div
                    style={{
                        height: 10,
                        cursor: "ns-resize",
                        background: "transparent",
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        zIndex: 10,
                        touchAction: "none",
                        WebkitTapHighlightColor: "transparent",
                    }}
                    onMouseDown={handleMouseDown}
                    onTouchStart={handleMouseDown}
                    onPointerDown={handleMouseDown}
                />
            )}
        </footer>
    );
};
