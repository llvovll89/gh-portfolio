import {createContext, useState} from "react";
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
}

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
        resizeSidebarWidth: 220,
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
        resizeFooterHeight: 220,
        resizeSidebarWidth: 300,
    });
    const [selectedPathState, setSelectedPathState] =
        useState<SelectedPathState>({
            list: [],
            state: DEFAULT,
        });
    const [selectedTheme, setSelectedTheme] = useState<SelectedThemeState>({
        mode: ThemeMode.BASE_NAVY,
        isVisibleThemeDropdown: false,
    });

    const [selectedNav, setSelectedNav] = useState<NavType | null>(
        NavType.FOLDER,
    );

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
