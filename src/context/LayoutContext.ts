import { createContext, useContext } from "react";

export interface LayoutState {
    resizeFooterHeight: number;
    resizeSidebarWidth: number;
}

export interface LayoutContextProps {
    layoutState: LayoutState;
    setLayoutState: React.Dispatch<React.SetStateAction<LayoutState>>;
}

export const DEFAULT_LAYOUT: LayoutState = { resizeFooterHeight: 32, resizeSidebarWidth: 300 };

export const LayoutContext = createContext<LayoutContextProps>({
    layoutState: DEFAULT_LAYOUT,
    setLayoutState: () => {},
});

export const useLayoutContext = () => useContext(LayoutContext);
