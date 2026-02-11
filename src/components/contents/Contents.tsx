import { useContext } from "react";
import { GlobalStateContext } from "../../context/GlobalState.context";
import { convertThemeTextColor, getTextColorFromBg } from "../../utils/convertThemeTextColor";
import { useCheckedMobileSize } from "../../hooks/useCheckedMobileSize";
import { ThemeMode } from "../../context/constatns/Theme.type";
import { LAYOUT_CONSTANTS } from "../../constants/layout";

interface ContentsProps {
    children?: React.ReactNode;
    className?: string;
}

export const Contents = ({ children, className }: ContentsProps) => {
    const { layoutState, selectedTheme } = useContext(GlobalStateContext);
    const isMobileSize = useCheckedMobileSize();

    // 커스텀 테마 적용
    const backgroundStyle = selectedTheme.mode === ThemeMode.CUSTOM && selectedTheme.customColor
        ? { backgroundColor: selectedTheme.customColor }
        : {};

    const backgroundClass = selectedTheme.mode === ThemeMode.CUSTOM
        ? ""
        : selectedTheme.mode;

    const textColor = selectedTheme.mode === ThemeMode.CUSTOM && selectedTheme.customColor
        ? getTextColorFromBg(selectedTheme.customColor)
        : convertThemeTextColor(selectedTheme.mode);

    return (
        <section
            className={`absolute top-10 right-0 flex flex-col sm:pb-10 pb-2 transition-width transition-transform ease-in-out overflow-y-hidden overflow-x-hidden gap-4 scrolls min-h-[calc(100dvh-40px)]
                max-h-[calc(100dvh-40px)]
                py-2 sm:py-4 md:py-6 ${isMobileSize ? "pl-1 pr-1" : "px-3 sm:px-4 md:px-6"} ${className} ${backgroundClass} ${textColor}`}
            style={{
                width: `calc(100% - ${isMobileSize ? LAYOUT_CONSTANTS.MOBILE_SIDEBAR_WIDTH : layoutState.resizeSidebarWidth}px)`,
                ...backgroundStyle,
            }}
        >
            {children}
        </section>
    );
};
