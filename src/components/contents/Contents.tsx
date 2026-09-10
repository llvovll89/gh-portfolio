import {useContext, useEffect, useRef, useState} from "react";
import {LayoutContext} from "../../context/LayoutContext";
import {useThemeStyle} from "../../hooks/useThemeStyle";
import {
    convertThemeTextColor,
    getTextColorFromBg,
} from "../../utils/convertThemeTextColor";
import {useCheckedMobileSize} from "../../hooks/useCheckedMobileSize";
import {ThemeMode} from "../../context/constatns/Theme.type";
import {LAYOUT_CONSTANTS} from "../../constants/layout";
import {LuArrowUp} from "react-icons/lu";

interface ContentsProps {
    children?: React.ReactNode;
    className?: string;
}

export const Contents = ({children, className}: ContentsProps) => {
    const {layoutState} = useContext(LayoutContext);
    const {backgroundStyle, backgroundClass, selectedTheme} = useThemeStyle();
    const isMobileSize = useCheckedMobileSize();
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showScrollTop, setShowScrollTop] = useState(false);
    const [readProgress, setReadProgress] = useState(0);
    const sectionRef = useRef<HTMLElement>(null);

    // 풀스크린 상태 감지
    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };

        document.addEventListener("fullscreenchange", handleFullscreenChange);
        return () =>
            document.removeEventListener(
                "fullscreenchange",
                handleFullscreenChange,
            );
    }, []);

    // 스크롤 to top 버튼 가시성 제어 + 읽기 진행도
    useEffect(() => {
        const el = sectionRef.current;
        if (!el) return;
        const handleScroll = () => {
            const {scrollTop, scrollHeight, clientHeight} = el;
            setShowScrollTop(scrollTop > 300);
            const total = scrollHeight - clientHeight;
            setReadProgress(total > 0 ? Math.min(1, scrollTop / total) : 0);
        };
        el.addEventListener("scroll", handleScroll, {passive: true});
        return () => el.removeEventListener("scroll", handleScroll);
    }, []);

    const textColor =
        selectedTheme.mode === ThemeMode.CUSTOM && selectedTheme.customColor
            ? getTextColorFromBg(selectedTheme.customColor)
            : convertThemeTextColor(selectedTheme.mode);

    return (
        <section
            ref={sectionRef}
            id="main-content"
            role="main"
            tabIndex={-1}
            className={`absolute right-0 flex flex-col sm:pb-10 transition-width transition-transform ease-in-out overflow-x-hidden overflow-y-auto gap-4 scrolls
                ${isMobileSize ? "top-16 h-[calc(100dvh-64px)] min-h-[calc(100dvh-64px)]" : "top-[68px] h-[calc(100dvh-92px)] min-h-[calc(100dvh-92px)]"}
                py-2 sm:py-3 md:py-4 ${isMobileSize ? "px-2 pb-24" : "px-2 sm:px-3 md:px-4 pb-2"} ${isFullscreen ? "justify-center" : ""} ${className} ${backgroundClass} ${textColor}`}
            style={{
                width: `calc(100% - ${isMobileSize ? LAYOUT_CONSTANTS.MOBILE_SIDEBAR_WIDTH : layoutState.resizeSidebarWidth}px)`,
                ...backgroundStyle,
            }}
        >
            {/* scrollHeight > clientHeight 일 때만 읽기 진행도 바 표시 */}
            {readProgress > 0 && (
                <div className="fixed top-0 left-0 right-0 h-[2px] z-40 pointer-events-none">
                    <div
                        className="h-full bg-primary origin-left"
                        style={{transform: `scaleX(${readProgress})`}}
                    />
                </div>
            )}
            {children}
            {showScrollTop && (
                <button
                    type="button"
                    aria-label="맨 위로 스크롤"
                    onClick={() =>
                        sectionRef.current?.scrollTo({
                            top: 0,
                            behavior: "smooth",
                        })
                    }
                    className="fixed bottom-14 right-4 z-20 p-2.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 text-white/70 hover:text-white backdrop-blur-sm transition-all duration-200 hover:scale-110 active:scale-95 shadow-lg"
                >
                    <LuArrowUp className="w-4 h-4" />
                </button>
            )}
        </section>
    );
};
