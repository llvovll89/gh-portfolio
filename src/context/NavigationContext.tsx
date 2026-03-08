import { createContext, useState, useEffect, useContext } from "react";
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

const NAV_STORAGE_KEY = "portfolio-selected-nav";

function loadSelectedNav(): NavType | null {
    try {
        const stored = localStorage.getItem(NAV_STORAGE_KEY);
        if (stored === "null") return null;
        if (stored && Object.values(NavType).includes(stored as NavType)) {
            return stored as NavType;
        }
    } catch {
        // ignore
    }
    return null;
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
    const [selectedNav, setSelectedNav] = useState<NavType | null>(loadSelectedNav);

    useEffect(() => {
        try {
            localStorage.setItem(NAV_STORAGE_KEY, selectedNav ?? "null");
        } catch {
            // ignore
        }
    }, [selectedNav]);

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
