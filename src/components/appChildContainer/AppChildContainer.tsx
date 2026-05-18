import { Suspense, lazy, useContext, useEffect } from "react";
import { KeyboardContext } from "../../context/KeyboardState.context";
import { useKeyboardEvent } from "../../hooks/useKeyboardEvent";

const LogViewer = lazy(() =>
    import("../LogViewer/LogViewer").then((m) => ({ default: m.LogViewer })),
);
const CommandPalette = lazy(() =>
    import("../commandPalette/CommandPalette").then((m) => ({ default: m.CommandPalette })),
);

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
            <Suspense fallback={null}>
                {submitCliCommand.isVisibleCommandUi && <LogViewer />}
                <CommandPalette />
            </Suspense>
        </>
    );
};
