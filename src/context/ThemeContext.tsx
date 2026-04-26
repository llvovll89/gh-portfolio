import { createContext, useState, useEffect, useContext } from "react";
import { ThemeMode } from "./constatns/Theme.type";

export interface SelectedThemeState {
    mode: ThemeMode;
    isVisibleThemeDropdown: boolean;
    customColor?: string;
}

interface ThemeContextProps {
    selectedTheme: SelectedThemeState;
    setSelectedTheme: React.Dispatch<React.SetStateAction<SelectedThemeState>>;
}

const THEME_STORAGE_KEY = "portfolio-theme-settings";

export const ThemeContext = createContext<ThemeContextProps>({
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
                    mode: parsed.mode || ThemeMode.BASE_NAVY,
                    isVisibleThemeDropdown: false,
                    customColor: parsed.customColor,
                };
            }
        } catch (error) {
            console.error("Failed to load theme settings:", error);
        }
        const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
        return { mode: prefersDark ? ThemeMode.DARK : ThemeMode.BASE_NAVY, isVisibleThemeDropdown: false };
    });

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
        <ThemeContext.Provider value={{ selectedTheme, setSelectedTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useThemeContext = () => useContext(ThemeContext);
