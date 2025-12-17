import {useContext, useEffect} from "react";
import {KeyboardContext} from "../context/KeyboardState.context";
import {GlobalStateContext} from "../context/GlobalState.context";
import {NavType} from "../components/aside/constants/Nav.type";
import {
    handleActiveFolderUI,
    handleActiveSearchUI,
    handleCloseKeyboardInfoUI,
    handleToggleFooterUI,
} from "../utils/keyboardEvents";

const notAllowedTags = ["input", "textarea", "select"];

export const useKeyboardEvent = () => {
    const {setIsVisibleKeyboardInfo} = useContext(KeyboardContext);
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
    };

    useEffect(() => {
        window.addEventListener("keydown", handleKeyDown);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, []);
};
