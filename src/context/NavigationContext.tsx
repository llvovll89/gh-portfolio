import { createContext, useState, useContext } from "react";
import { DEFAULT } from "../routes/route";
import { NavType } from "../components/aside/constants/Nav.type";

export interface SelectedPathState {
    list: string[];
    state: string;
}

interface NavigationContextProps {
    selectedPath: string;
    setSelectedPath: React.Dispatch<React.SetStateAction<string>>;
    selectedPathState: SelectedPathState;
    setSelectedPathState: React.Dispatch<React.SetStateAction<SelectedPathState>>;
    selectedNav: NavType | null;
    setSelectedNav: React.Dispatch<React.SetStateAction<NavType | null>>;
}

export const NavigationContext = createContext<NavigationContextProps>({
    selectedPath: "",
    setSelectedPath: () => {},
    selectedPathState: { list: [], state: "" },
    setSelectedPathState: () => {},
    selectedNav: null,
    setSelectedNav: () => {},
});

export const NavigationProvider = ({ children }: { children: React.ReactNode }) => {
    const [selectedPath, setSelectedPath] = useState<string>("");
    const [selectedPathState, setSelectedPathState] = useState<SelectedPathState>({
        list: [],
        state: DEFAULT,
    });
    const [selectedNav, setSelectedNav] = useState<NavType | null>(null);

    return (
        <NavigationContext.Provider
            value={{
                selectedPath,
                setSelectedPath,
                selectedPathState,
                setSelectedPathState,
                selectedNav,
                setSelectedNav,
            }}
        >
            {children}
        </NavigationContext.Provider>
    );
};

export const useNavigationContext = () => useContext(NavigationContext);
