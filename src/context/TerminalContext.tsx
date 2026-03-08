import { createContext, useState, useContext } from "react";

interface TerminalContextProps {
    isTerminalVisible: boolean;
    setIsTerminalVisible: React.Dispatch<React.SetStateAction<boolean>>;
}

export const TerminalContext = createContext<TerminalContextProps>({
    isTerminalVisible: false,
    setIsTerminalVisible: () => {},
});

export const TerminalProvider = ({ children }: { children: React.ReactNode }) => {
    const [isTerminalVisible, setIsTerminalVisible] = useState<boolean>(false);

    return (
        <TerminalContext.Provider value={{ isTerminalVisible, setIsTerminalVisible }}>
            {children}
        </TerminalContext.Provider>
    );
};

export const useTerminalContext = () => useContext(TerminalContext);
