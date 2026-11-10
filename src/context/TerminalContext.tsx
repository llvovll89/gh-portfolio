import { useState, useMemo } from "react";
import { TerminalContext } from "./TerminalState";

export const TerminalProvider = ({ children }: { children: React.ReactNode }) => {
    const [isTerminalVisible, setIsTerminalVisible] = useState<boolean>(false);

    const value = useMemo(() => ({ isTerminalVisible, setIsTerminalVisible }), [isTerminalVisible]);

    return (
        <TerminalContext.Provider value={value}>
            {children}
        </TerminalContext.Provider>
    );
};
