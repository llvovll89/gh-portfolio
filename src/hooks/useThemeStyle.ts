import { useContext } from "react";
import { ThemeContext } from "../context/ThemeContext";
import { ThemeMode } from "../context/constatns/Theme.type";

/**
 * 테마에 따른 배경 스타일/클래스를 반환하는 훅
 * Header, Aside, Footer 등 테마 배경 적용이 필요한 컴포넌트에서 사용
 */
export const useThemeStyle = () => {
    const { selectedTheme } = useContext(ThemeContext);

    const backgroundStyle =
        selectedTheme.mode === ThemeMode.CUSTOM && selectedTheme.customColor
            ? { backgroundColor: selectedTheme.customColor }
            : {};

    const backgroundClass =
        selectedTheme.mode === ThemeMode.CUSTOM ? "" : selectedTheme.mode;

    return { backgroundStyle, backgroundClass, selectedTheme };
};
