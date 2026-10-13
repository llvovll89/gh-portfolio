import { useState } from "react";
import { TerminalContext } from "./TerminalState";

export const TerminalProvider = ({ children }: { children: React.ReactNode }) => {
    const [isTerminalVisible, setIsTerminalVisible] = useState<boolean>(false);

    return (
        <TerminalContext.Provider value={{ isTerminalVisible, setIsTerminalVisible }}>
            {children}
        </TerminalContext.Provider>
    );
};
