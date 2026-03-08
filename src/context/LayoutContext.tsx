import { createContext, useState, useContext } from "react";

export interface LayoutState {
    resizeFooterHeight: number;
    resizeSidebarWidth: number;
}

interface LayoutContextProps {
    layoutState: LayoutState;
    setLayoutState: React.Dispatch<React.SetStateAction<LayoutState>>;
}

export const LayoutContext = createContext<LayoutContextProps>({
    layoutState: { resizeFooterHeight: 0, resizeSidebarWidth: 0 },
    setLayoutState: () => {},
});

export const LayoutProvider = ({ children }: { children: React.ReactNode }) => {
    const [layoutState, setLayoutState] = useState<LayoutState>({
        resizeFooterHeight: 32,
        resizeSidebarWidth: 300,
    });

    return (
        <LayoutContext.Provider value={{ layoutState, setLayoutState }}>
            {children}
        </LayoutContext.Provider>
    );
};

export const useLayoutContext = () => useContext(LayoutContext);
