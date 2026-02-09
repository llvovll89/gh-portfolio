import { useContext, useEffect } from "react";
import { KeyboardContext } from "../../context/KeyboardState.context";
import { LogViewer } from "../LogViewer/LogViewer";
import { useKeyboardEvent } from "../../hooks/useKeyboardEvent";
import { CommandPalette } from "../commandPalette/CommandPalette";

export const AppChildContainer = () => {
    const { submitCliCommand, setSubmitCliCommand } = useContext(KeyboardContext);
    useKeyboardEvent();

    useEffect(() => {
        return () => {
            setSubmitCliCommand((prev) => ({
                ...prev,
                isVisibleCommandUi: false,
            }));
        };
    }, []);

    return (
        <>
            {submitCliCommand.isVisibleCommandUi && <LogViewer />}
            <CommandPalette />
        </>
    );
};
