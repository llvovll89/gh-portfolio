import {createContext, useState} from "react";
import {MAIN} from "../routes/route";
import {NavType} from "../components/aside/constants/Nav.type";

interface LayoutState {
    resizeFooterHeight: number;
    resizeSidebarWidth: number;
}

interface SelectedPathState {
    list: string[];
    state: string;
}

interface GlobalStateContextProps {
    selectedPath: string;
    setSelectedPath: React.Dispatch<React.SetStateAction<string>>;
    layoutState: LayoutState;
    setLayoutState: React.Dispatch<React.SetStateAction<LayoutState>>;
    selectedPathState: SelectedPathState;
    setSelectedPathState: React.Dispatch<
        React.SetStateAction<SelectedPathState>
    >;
    selectedNav: NavType | null;
    setSelectedNav: React.Dispatch<React.SetStateAction<NavType | null>>;
}

export const GlobalStateContext = createContext<GlobalStateContextProps>({
    selectedPath: "",
    setSelectedPath: () => {},
    layoutState: {
        resizeFooterHeight: 0,
        resizeSidebarWidth: 300,
    },
    setLayoutState: () => {},
    selectedPathState: {list: [], state: ""},
    setSelectedPathState: () => {},
    selectedNav: null,
    setSelectedNav: () => {},
});

export const GlobalStateProvider = ({
    children,
}: {
    children: React.ReactNode;
}) => {
    const [selectedPath, setSelectedPath] = useState<string>("");
    const [layoutState, setLayoutState] = useState<LayoutState>({
        resizeFooterHeight: 0,
        resizeSidebarWidth: 300,
    });
    const [selectedPathState, setSelectedPathState] =
        useState<SelectedPathState>({
            list: [MAIN],
            state: MAIN,
        });

    const [selectedNav, setSelectedNav] = useState<NavType | null>(
        NavType.FOLDER
    );

    return (
        <GlobalStateContext.Provider
            value={{
                selectedPath,
                setSelectedPath,
                layoutState,
                setLayoutState,
                selectedPathState,
                setSelectedPathState,
                selectedNav,
                setSelectedNav,
            }}
        >
            {children}
        </GlobalStateContext.Provider>
    );
};
