import { createContext, useState, useEffect, useContext } from "react";

export interface LayoutState {
    resizeFooterHeight: number;
    resizeSidebarWidth: number;
}

interface LayoutContextProps {
    layoutState: LayoutState;
    setLayoutState: React.Dispatch<React.SetStateAction<LayoutState>>;
}

const LAYOUT_STORAGE_KEY = "portfolio-layout-state";
const DEFAULT_LAYOUT: LayoutState = { resizeFooterHeight: 32, resizeSidebarWidth: 300 };

function loadLayout(): LayoutState {
    try {
        const stored = localStorage.getItem(LAYOUT_STORAGE_KEY);
        if (stored) {
            const parsed = JSON.parse(stored);
            return {
                resizeFooterHeight: parsed.resizeFooterHeight ?? DEFAULT_LAYOUT.resizeFooterHeight,
                resizeSidebarWidth: parsed.resizeSidebarWidth ?? DEFAULT_LAYOUT.resizeSidebarWidth,
            };
        }
    } catch {
        // ignore
    }
    return DEFAULT_LAYOUT;
}

export const LayoutContext = createContext<LayoutContextProps>({
    layoutState: DEFAULT_LAYOUT,
    setLayoutState: () => {},
});

export const LayoutProvider = ({ children }: { children: React.ReactNode }) => {
    const [layoutState, setLayoutState] = useState<LayoutState>(loadLayout);

    useEffect(() => {
        try {
            localStorage.setItem(LAYOUT_STORAGE_KEY, JSON.stringify(layoutState));
        } catch {
            // ignore
        }
    }, [layoutState.resizeFooterHeight, layoutState.resizeSidebarWidth]);

    return (
        <LayoutContext.Provider value={{ layoutState, setLayoutState }}>
            {children}
        </LayoutContext.Provider>
    );
};

export const useLayoutContext = () => useContext(LayoutContext);
