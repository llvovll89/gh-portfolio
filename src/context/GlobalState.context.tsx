import {createContext, useState} from "react";

interface LayoutState {
    isVisibleSidebar: boolean;
    setIsVisibleSidebar: React.Dispatch<React.SetStateAction<boolean>>;
    resizeFooterHeight: number;
    setResizeFooterHeight: React.Dispatch<React.SetStateAction<number>>;
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
        isVisibleSidebar: true,
        setIsVisibleSidebar: () => {},
        resizeFooterHeight: 0,
        setResizeFooterHeight: () => {},
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
        isVisibleSidebar: false,
        setIsVisibleSidebar: () => {},
        resizeFooterHeight: 0,
        setResizeFooterHeight: () => {},
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
