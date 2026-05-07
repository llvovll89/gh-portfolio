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
    closedTabs: string[];
    setClosedTabs: React.Dispatch<React.SetStateAction<string[]>>;
    pinnedTabs: string[];
    setPinnedTabs: React.Dispatch<React.SetStateAction<string[]>>;
}

const NAV_STORAGE_KEY = "portfolio-selected-nav";
const NAV_PATH_STATE_STORAGE_KEY = "portfolio-selected-path-state";
const CLOSED_TABS_STORAGE_KEY = "portfolio-closed-tabs";
const PINNED_TABS_STORAGE_KEY = "portfolio-pinned-tabs";

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

function loadSelectedPathState(): SelectedPathState {
    try {
        const stored = localStorage.getItem(NAV_PATH_STATE_STORAGE_KEY);
        if (!stored) {
            return { list: [DEFAULT], state: DEFAULT };
        }

        const parsed = JSON.parse(stored);
        const list = Array.isArray(parsed?.list)
            ? parsed.list.filter((path: unknown): path is string => typeof path === "string")
            : [];
        const state = typeof parsed?.state === "string" ? parsed.state : "";

        const nextList = list.length > 0 ? [...new Set(list)] : [DEFAULT];
        const nextState = nextList.includes(state) ? state : nextList[0];

        return {
            list: nextList,
            state: nextState,
        };
    } catch {
        return { list: [DEFAULT], state: DEFAULT };
    }
}

function loadClosedTabs(): string[] {
    try {
        const stored = localStorage.getItem(CLOSED_TABS_STORAGE_KEY);
        if (!stored) return [];

        const parsed = JSON.parse(stored);
        if (!Array.isArray(parsed)) return [];

        return parsed.filter((path: unknown): path is string => typeof path === "string");
    } catch {
        return [];
    }
}

function loadPinnedTabs(): string[] {
    try {
        const stored = localStorage.getItem(PINNED_TABS_STORAGE_KEY);
        if (!stored) return [];

        const parsed = JSON.parse(stored);
        if (!Array.isArray(parsed)) return [];

        return [...new Set(parsed.filter((path: unknown): path is string => typeof path === "string"))];
    } catch {
        return [];
    }
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

export const NavigationProvider = ({ children }: { children: React.ReactNode }) => {
    const [selectedPath, setSelectedPath] = useState<string>("");
    const [selectedPathState, setSelectedPathState] = useState<SelectedPathState>(loadSelectedPathState);
    const [selectedNav, setSelectedNav] = useState<NavType | null>(loadSelectedNav);
    const [closedTabs, setClosedTabs] = useState<string[]>(loadClosedTabs);
    const [pinnedTabs, setPinnedTabs] = useState<string[]>(loadPinnedTabs);

    useEffect(() => {
        try {
            localStorage.setItem(NAV_STORAGE_KEY, selectedNav ?? "null");
        } catch {
            // ignore
        }
    }, [selectedNav]);

    useEffect(() => {
        try {
            localStorage.setItem(
                NAV_PATH_STATE_STORAGE_KEY,
                JSON.stringify(selectedPathState),
            );
        } catch {
            // ignore
        }
    }, [selectedPathState]);

    useEffect(() => {
        try {
            localStorage.setItem(CLOSED_TABS_STORAGE_KEY, JSON.stringify(closedTabs));
        } catch {
            // ignore
        }
    }, [closedTabs]);

    useEffect(() => {
        try {
            localStorage.setItem(PINNED_TABS_STORAGE_KEY, JSON.stringify(pinnedTabs));
        } catch {
            // ignore
        }
    }, [pinnedTabs]);

    useEffect(() => {
        setPinnedTabs((prev) =>
            prev.filter((path) => selectedPathState.list.includes(path)),
        );
    }, [selectedPathState.list]);

    return (
        <NavigationContext.Provider
            value={{
                selectedPath,
                setSelectedPath,
                selectedPathState,
                setSelectedPathState,
                selectedNav,
                setSelectedNav,
                closedTabs,
                setClosedTabs,
                pinnedTabs,
                setPinnedTabs,
            }}
        >
            {children}
        </NavigationContext.Provider>
    );
};

export const useNavigationContext = () => useContext(NavigationContext);
