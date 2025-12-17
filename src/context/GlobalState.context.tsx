import {createContext, useState} from "react";

interface LayoutState {
    resizeFooterHeight: number;
    setResizeFooterHeight: React.Dispatch<React.SetStateAction<number>>;
    resizeSidebarWidth: number;
    setResizeSidebarWidth?: React.Dispatch<React.SetStateAction<number>>;
}

interface GlobalStateContextProps {
    selectedPath: string;
    setSelectedPath: React.Dispatch<React.SetStateAction<string>>;
    layoutState: LayoutState;
    setLayoutState: React.Dispatch<React.SetStateAction<LayoutState>>;
}

export const GlobalStateContext = createContext<GlobalStateContextProps>({
    selectedPath: "",
    setSelectedPath: () => {},
    layoutState: {
        resizeFooterHeight: 0,
        setResizeFooterHeight: () => {},
        resizeSidebarWidth: 300,
        setResizeSidebarWidth: () => {},
    },
    setLayoutState: () => {},
});

export const GlobalStateProvider = ({
    children,
}: {
    children: React.ReactNode;
}) => {
    const [selectedPath, setSelectedPath] = useState<string>("");
    const [layoutState, setLayoutState] = useState<LayoutState>({
        resizeFooterHeight: 0,
        setResizeFooterHeight: () => {},
        resizeSidebarWidth: 300,
        setResizeSidebarWidth: () => {},
    });

    return (
        <GlobalStateContext.Provider
            value={{
                selectedPath,
                setSelectedPath,
                layoutState,
                setLayoutState,
            }}
        >
            {children}
        </GlobalStateContext.Provider>
    );
};
