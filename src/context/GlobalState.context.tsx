import {createContext, useState} from "react";

interface GlobalStateContextProps {
    selectedPath: string;
    setSelectedPath: React.Dispatch<React.SetStateAction<string>>;
    isVisibleSidebar: boolean;
    setIsVisibleSidebar: React.Dispatch<React.SetStateAction<boolean>>;
}

export const GlobalStateContext = createContext<GlobalStateContextProps>({
    selectedPath: "",
    setSelectedPath: () => {},
    isVisibleSidebar: true,
    setIsVisibleSidebar: () => {},
});

export const GlobalStateProvider = ({
    children,
}: {
    children: React.ReactNode;
}) => {
    const [pathState, setPathState] = useState<string>("");
    const [isVisibleSidebar, setIsVisibleSidebar] = useState<boolean>(true);

    return (
        <GlobalStateContext.Provider
            value={{
                selectedPath: pathState,
                setSelectedPath: setPathState,
                isVisibleSidebar,
                setIsVisibleSidebar,
            }}
        >
            {children}
        </GlobalStateContext.Provider>
    );
};
