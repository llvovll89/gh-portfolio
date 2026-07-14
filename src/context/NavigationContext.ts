import { createContext, useContext } from "react";
import { NavType } from "../components/aside/constants/Nav.type";

export interface SelectedPathState {
    list: string[];
    state: string;
}

export interface NavigationContextProps {
    selectedPath: string;
    setSelectedPath: React.Dispatch<React.SetStateAction<string>>;
    selectedPathState: SelectedPathState;
    setSelectedPathState: React.Dispatch<React.SetStateAction<SelectedPathState>>;
    selectedNav: NavType | null;
    setSelectedNav: React.Dispatch<React.SetStateAction<NavType | null>>;
    closedTabs: string[];
    setClosedTabs: React.Dispatch<React.SetStateAction<string[]>>;
    pinnedTabs: string[];
    setPinnedTabs: React.Dispatch<React.SetStateAction<string[]>>;
}

export const NavigationContext = createContext<NavigationContextProps>({
    selectedPath: "",
    setSelectedPath: () => {},
    selectedPathState: { list: [], state: "" },
    setSelectedPathState: () => {},
    selectedNav: null,
    setSelectedNav: () => {},
    closedTabs: [],
    setClosedTabs: () => {},
    pinnedTabs: [],
    setPinnedTabs: () => {},
});

export const useNavigationContext = () => useContext(NavigationContext);
