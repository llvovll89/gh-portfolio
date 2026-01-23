import {useContext, useEffect, useRef} from "react";
import {GlobalStateContext} from "../../context/GlobalState.context";
import {useDragging} from "../../hooks/useDragging";
import {Cli} from "./cli/Cli";
import {handleToggleFooterUI} from "../../utils/keyboardEvents";
import {useCheckedMobileSize} from "../../hooks/useCheckedMobileSize";

const COLLAPSED_HEIGHT = 32; // 헤더 바 높이(h-8)
const OPEN_HEIGHT = 220; // 열렸을 때 최소 높이

export const Bottom = () => {
    const {layoutState, selectedTheme, setLayoutState} =
        useContext(GlobalStateContext);

    const footerRef = useRef<HTMLDivElement>(null);
    const handleMouseDown = useDragging({targetRef: footerRef, type: "footer"});

    const isOpen = layoutState.resizeFooterHeight > COLLAPSED_HEIGHT;
    const isMobileSize = useCheckedMobileSize();

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

    useEffect(() => {
        const onKeyDown = (event: KeyboardEvent) => {
            handleToggleFooterUI(event, setLayoutState);
        };
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [setLayoutState]);

    return (
        <footer
            ref={footerRef}
            className={`absolute z-10 bottom-0 right-0 border-t border-sub-gary/30 ${selectedTheme.mode} overflow-hidden`}
            style={{
                width: `calc(100% - ${isMobileSize ? "40" : layoutState.resizeSidebarWidth}px)`,
                height: layoutState.resizeFooterHeight || COLLAPSED_HEIGHT,
            }}
        >
            <header
                className="select-none text-sub-gary text-xs w-full h-8 flex items-center gap-2 px-3 justify-between"
                onDoubleClick={() => (isOpen ? closeFooter() : openFooter())}
                title="더블클릭 시 터미널 열기/닫기"
            >
                <button
                    type="button"
                    onClick={() => (isOpen ? closeFooter() : openFooter())}
                    className="flex items-center gap-1 cursor-pointer"
                    aria-label="터미널 열기/닫기"
                >
                    <span className="border-b border-primary">TERMINAL</span>
                    <span className="text-white/70 text-[1.25rem]">
                        {isOpen ? "▾" : "▴"}
                    </span>
                </button>
            </header>

            {/* 열렸을 때만 CLI 렌더 */}
            {isOpen && <Cli />}

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
