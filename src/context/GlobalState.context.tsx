import {createContext, useState, useEffect} from "react";
import {DEFAULT} from "../routes/route";
import {NavType} from "../components/aside/constants/Nav.type";
import {ThemeMode} from "./constatns/Theme.type";

export interface LayoutState {
    resizeFooterHeight: number;
    resizeSidebarWidth: number;
}

export interface SelectedPathState {
    list: string[];
    state: string;
}

interface SelectedThemeState {
    mode: ThemeMode;
    isVisibleThemeDropdown: boolean;
    customColor?: string;
}

const THEME_STORAGE_KEY = 'portfolio-theme-settings';

interface GlobalStateContextProps {
    selectedPath: string;
    setSelectedPath: React.Dispatch<React.SetStateAction<string>>;
    layoutState: LayoutState;
    setLayoutState: React.Dispatch<React.SetStateAction<LayoutState>>;
    selectedPathState: SelectedPathState;
    setSelectedPathState: React.Dispatch<
        React.SetStateAction<SelectedPathState>
    >;
    selectedNav: NavType | null;
    setSelectedNav: React.Dispatch<React.SetStateAction<NavType | null>>;
    selectedTheme: SelectedThemeState;
    setSelectedTheme: React.Dispatch<React.SetStateAction<SelectedThemeState>>;
}

export const GlobalStateContext = createContext<GlobalStateContextProps>({
    selectedPath: "",
    setSelectedPath: () => {},
    layoutState: {
        resizeFooterHeight: 0,
        resizeSidebarWidth: 0,
    },
    setLayoutState: () => {},
    selectedPathState: {list: [], state: ""},
    setSelectedPathState: () => {},
    selectedNav: null,
    setSelectedNav: () => {},
    selectedTheme: {
        mode: ThemeMode.BASE_NAVY,
        isVisibleThemeDropdown: false,
    },
    setSelectedTheme: () => {},
});

export const GlobalStateProvider = ({
    children,
}: {
    children: React.ReactNode;
}) => {
    const [selectedPath, setSelectedPath] = useState<string>("");
    const [layoutState, setLayoutState] = useState<LayoutState>({
        resizeFooterHeight: 32,
        resizeSidebarWidth: 300,
    });
    const [selectedPathState, setSelectedPathState] =
        useState<SelectedPathState>({
            list: [],
            state: DEFAULT,
        });
    const [selectedTheme, setSelectedTheme] = useState<SelectedThemeState>(() => {
        // 초기값을 localStorage에서 로드
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
            console.error('Failed to load theme settings:', error);
        }
        return {
            mode: ThemeMode.BASE_NAVY,
            isVisibleThemeDropdown: false,
        };
    });

    const [selectedNav, setSelectedNav] = useState<NavType | null>(null);

    // 테마 변경 시 localStorage에 저장
    useEffect(() => {
        try {
            localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify({
                mode: selectedTheme.mode,
                customColor: selectedTheme.customColor,
            }));
        } catch (error) {
            console.error('Failed to save theme settings:', error);
        }
    }, [selectedTheme.mode, selectedTheme.customColor]);

    return (
        <GlobalStateContext.Provider
            value={{
                selectedPath,
                setSelectedPath,
                layoutState,
                setLayoutState,
                selectedPathState,
                setSelectedPathState,
                selectedNav,
                setSelectedNav,
                selectedTheme,
                setSelectedTheme,
            }}
        >
            {children}
        </GlobalStateContext.Provider>
    );
};
