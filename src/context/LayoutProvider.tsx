import { useState, useEffect } from "react";
import { LayoutContext, DEFAULT_LAYOUT, type LayoutState } from "./LayoutContext";

const LAYOUT_STORAGE_KEY = "portfolio-layout-state";

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

export const LayoutProvider = ({ children }: { children: React.ReactNode }) => {
    const [layoutState, setLayoutState] = useState<LayoutState>(loadLayout);

    useEffect(() => {
        try {
            localStorage.setItem(LAYOUT_STORAGE_KEY, JSON.stringify(layoutState));
        } catch {
            // ignore
        }
    }, [layoutState]);

    return (
        <LayoutContext.Provider value={{ layoutState, setLayoutState }}>
            {children}
        </LayoutContext.Provider>
    );
};
