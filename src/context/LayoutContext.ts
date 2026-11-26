import { createContext, useContext } from "react";

export interface LayoutState {
    resizeFooterHeight: number;
    resizeSidebarWidth: number;
    /** 탐색 패널을 펼쳤을 때 쓸 너비 (사용자가 조절한 값을 닫았다 열거나 페이지를 옮겨도 유지) */
    expandedSidebarWidth?: number;
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
