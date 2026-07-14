import { useState, useEffect } from "react";
import { DEFAULT } from "../routes/route";
import { NavType } from "../components/aside/constants/Nav.type";
import { NavigationContext, type SelectedPathState } from "./NavigationContext";

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

        const parsed: unknown = JSON.parse(stored);
        const parsedState =
            parsed && typeof parsed === "object"
                ? (parsed as { list?: unknown; state?: unknown })
                : undefined;

        const list = Array.isArray(parsedState?.list)
            ? parsedState.list.filter((path: unknown): path is string => typeof path === "string")
            : [];
        const state = typeof parsedState?.state === "string" ? parsedState.state : "";

        const nextList: string[] = list.length > 0 ? [...new Set(list)] : [DEFAULT];
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
        // 열린 탭 목록(selectedPathState.list)에서 사라진 경로의 고정 핀을 정리하는 동기화이므로 effect가 적절함
        // eslint-disable-next-line react-hooks/set-state-in-effect
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
