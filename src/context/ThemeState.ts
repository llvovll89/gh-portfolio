import { createContext, useContext } from "react";
import { ThemeMode } from "./constatns/Theme.type";

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


export const ThemeContext = createContext<ThemeContextProps>({
    resolvedDark: true,
    selectedTheme: {
        mode: ThemeMode.BASE_NAVY,
        isVisibleThemeDropdown: false,
    },
    setSelectedTheme: () => {},
});


export const useThemeContext = () => useContext(ThemeContext);
