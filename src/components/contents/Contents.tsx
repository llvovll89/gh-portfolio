import { useContext } from "react";
import { GlobalStateContext } from "../../context/GlobalState.context";
import { convertThemeTextColor, getTextColorFromBg } from "../../utils/convertThemeTextColor";
import { useCheckedMobileSize } from "../../hooks/useCheckedMobileSize";
import { ThemeMode } from "../../context/constatns/Theme.type";

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
            className={`absolute top-10 right-0 flex flex-col transition-width transition-transform ease-in-out overflow-auto gap-4 scrolls min-h-[calc(100dvh-40px)]
                max-h-[calc(100dvh-40px)]
                py-3 sm:py-4 md:py-6 ${isMobileSize ? "pl-12 pr-3" : "px-3 sm:px-4 md:px-6"} ${className} ${backgroundClass} ${textColor}`}
            style={{
                width: `calc(100% - ${isMobileSize ? 0 : layoutState.resizeSidebarWidth}px)`,
                ...backgroundStyle,
            }}
        >
            {children}
        </section>
    );
};
