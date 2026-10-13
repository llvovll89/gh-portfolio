import { createContext, useContext } from "react";

interface TerminalContextProps {
    isTerminalVisible: boolean;
    setIsTerminalVisible: React.Dispatch<React.SetStateAction<boolean>>;
}

export const TerminalContext = createContext<TerminalContextProps>({
    isTerminalVisible: false,
    setIsTerminalVisible: () => {},
});


export const useTerminalContext = () => useContext(TerminalContext);
