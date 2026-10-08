import { useContext } from "react";
import { ThemeContext } from "../context/ThemeContext";

/**
 * 테마에 따른 배경 스타일/클래스를 반환하는 훅
 * Header, Aside, Footer 등 테마 배경 적용이 필요한 컴포넌트에서 사용
 */
export const useThemeStyle = () => {
    const { selectedTheme, resolvedDark } = useContext(ThemeContext);

    const backgroundStyle = { backgroundColor: "var(--surface)", color: "var(--text-primary)" };
    const backgroundClass = "workbench-surface";

    return { backgroundStyle, backgroundClass, selectedTheme, isDark: resolvedDark };
};
