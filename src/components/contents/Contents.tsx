import {useContext, useEffect, useState} from "react";
import {LayoutContext} from "../../context/LayoutContext";
import {useThemeStyle} from "../../hooks/useThemeStyle";
import {
    convertThemeTextColor,
    getTextColorFromBg,
} from "../../utils/convertThemeTextColor";
import {useCheckedMobileSize} from "../../hooks/useCheckedMobileSize";
import {ThemeMode} from "../../context/constatns/Theme.type";
import {LAYOUT_CONSTANTS} from "../../constants/layout";

interface ContentsProps {
    children?: React.ReactNode;
    className?: string;
}

export const Contents = ({children, className}: ContentsProps) => {
    const {layoutState} = useContext(LayoutContext);
    const {backgroundStyle, backgroundClass, selectedTheme} = useThemeStyle();
    const isMobileSize = useCheckedMobileSize();
    const [isFullscreen, setIsFullscreen] = useState(false);

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

    const textColor =
        selectedTheme.mode === ThemeMode.CUSTOM && selectedTheme.customColor
            ? getTextColorFromBg(selectedTheme.customColor)
            : convertThemeTextColor(selectedTheme.mode);

    return (
        <section
            id="main-content"
            role="main"
            tabIndex={-1}
            className={`absolute top-10 right-0 flex flex-col sm:pb-10 transition-width transition-transform ease-in-out overflow-x-hidden overflow-y-auto gap-4 scrolls h-[calc(100dvh-40px)] min-h-[calc(100dvh-40px)]
                py-2 sm:py-3 md:py-4 ${isMobileSize ? "px-2 pb-16" : "px-2 sm:px-3 md:px-4 pb-2"} ${isFullscreen ? "justify-center" : ""} ${className} ${backgroundClass} ${textColor}`}
            style={{
                width: `calc(100% - ${isMobileSize ? LAYOUT_CONSTANTS.MOBILE_SIDEBAR_WIDTH : layoutState.resizeSidebarWidth}px)`,
                ...backgroundStyle,
            }}
        >
            {children}
        </section>
    );
};
