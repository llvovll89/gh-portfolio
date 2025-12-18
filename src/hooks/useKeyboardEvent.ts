import {useContext, useEffect} from "react";
import {KeyboardContext} from "../context/KeyboardState.context";
import {GlobalStateContext} from "../context/GlobalState.context";

import {
    handleActiveFolderUI,
    handleActiveSearchUI,
    handleAllClear,
    handleCliEnterEvent,
    handleCloseKeyboardInfoUI,
    handleToggleFooterUI,
} from "../utils/keyboardEvents";

const notAllowedTags = ["input", "select"];

export const useKeyboardEvent = () => {
    const {setIsVisibleKeyboardInfo, setSubmitCliCommand} =
        useContext(KeyboardContext);
    const {setLayoutState, setSelectedNav} = useContext(GlobalStateContext);

    const handleKeyDown = (event: KeyboardEvent) => {
        const target = event.target as HTMLElement;
        const tag = target.tagName.toLowerCase();

        if (notAllowedTags.includes(tag) && !event.ctrlKey) {
            return;
        }

        handleToggleFooterUI(event, setLayoutState);
        handleCloseKeyboardInfoUI(event, setIsVisibleKeyboardInfo);
        handleActiveFolderUI(event, setSelectedNav);
        handleActiveSearchUI(event, setSelectedNav);
        handleCliEnterEvent(event, setSubmitCliCommand);
        handleAllClear(event, setSubmitCliCommand, setIsVisibleKeyboardInfo);
    };

    useEffect(() => {
        window.addEventListener("keydown", handleKeyDown);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, []);
};
