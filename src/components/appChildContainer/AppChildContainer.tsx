import { Suspense, lazy, useContext, useEffect } from "react";
import { KeyboardContext } from "../../context/KeyboardState";
import { useKeyboardEvent } from "../../hooks/useKeyboardEvent";

const LogViewer = lazy(() =>
    import("../LogViewer/LogViewer").then((m) => ({ default: m.LogViewer })),
);
const CommandPalette = lazy(() =>
    import("../commandPalette/CommandPalette").then((m) => ({ default: m.CommandPalette })),
);

export const AppChildContainer = () => {
    const { submitCliCommand, setSubmitCliCommand, isVisibleCommandPalette } = useContext(KeyboardContext);
    useKeyboardEvent();

    useEffect(() => {
        return () => {
            setSubmitCliCommand((prev) => ({
                ...prev,
                isVisibleCommandUi: false,
            }));
        };
    }, [setSubmitCliCommand]);

    return (
        <>
            <Suspense fallback={null}>
                {submitCliCommand.isVisibleCommandUi && <LogViewer />}
                {isVisibleCommandPalette && <CommandPalette />}
            </Suspense>
        </>
    );
};
