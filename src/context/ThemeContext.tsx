import { createContext, useState, useEffect, useLayoutEffect, useContext, useMemo } from "react";
import { ThemeMode } from "./constatns/Theme.type";
import { getThemePalette } from "../utils/themePalette";

export interface SelectedThemeState {
    mode: ThemeMode;
    isVisibleThemeDropdown: boolean;
    customColor?: string;
}

interface ThemeContextProps {
    resolvedDark: boolean;
    selectedTheme: SelectedThemeState;
    setSelectedTheme: React.Dispatch<React.SetStateAction<SelectedThemeState>>;
}

const THEME_STORAGE_KEY = "portfolio-theme-settings";

export const ThemeContext = createContext<ThemeContextProps>({
    resolvedDark: true,
    selectedTheme: {
        mode: ThemeMode.BASE_NAVY,
        isVisibleThemeDropdown: false,
    },
    setSelectedTheme: () => {},
});

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
    const [selectedTheme, setSelectedTheme] = useState<SelectedThemeState>(() => {
        try {
            const stored = localStorage.getItem(THEME_STORAGE_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                return {
                    mode: Object.values(ThemeMode).includes(parsed.mode) ? parsed.mode : ThemeMode.SYSTEM,
                    isVisibleThemeDropdown: false,
                    customColor: parsed.customColor,
                };
            }
        } catch (error) {
            console.error("Failed to load theme settings:", error);
        }
        return { mode: ThemeMode.SYSTEM, isVisibleThemeDropdown: false };
    });

    const [systemDark, setSystemDark] = useState(() => window.matchMedia('(prefers-color-scheme: dark)').matches);
    useEffect(() => {
        const media = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = (event: MediaQueryListEvent) => setSystemDark(event.matches);
        media.addEventListener('change', handleChange);
        return () => media.removeEventListener('change', handleChange);
    }, []);

    const palette = useMemo(() => getThemePalette(selectedTheme.mode, selectedTheme.customColor, systemDark), [selectedTheme.mode, selectedTheme.customColor, systemDark]);
    useLayoutEffect(() => {
        const root = document.documentElement;
        root.dataset.theme = palette.dark ? 'dark' : 'light';
        root.style.colorScheme = palette.dark ? 'dark' : 'light';
        for (const [name, value] of Object.entries(palette.variables)) root.style.setProperty(name, value);
    }, [palette]);

    useEffect(() => {
        try {
            localStorage.setItem(
                THEME_STORAGE_KEY,
                JSON.stringify({
                    mode: selectedTheme.mode,
                    customColor: selectedTheme.customColor,
                }),
            );
        } catch (error) {
            console.error("Failed to save theme settings:", error);
        }
    }, [selectedTheme.mode, selectedTheme.customColor]);

    return (
        <ThemeContext.Provider value={{ selectedTheme, setSelectedTheme, resolvedDark: palette.dark }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useThemeContext = () => useContext(ThemeContext);
