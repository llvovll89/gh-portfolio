import { createContext } from "react";

export interface submitCliCommandType {
    value: string;
    isVisibleCommandUi: boolean;
}

interface KeyboardContextProps {
    isVisibleKeyboardInfo: boolean;
    setIsVisibleKeyboardInfo: React.Dispatch<React.SetStateAction<boolean>>;
    toggleKeyboardInfo: () => void;
    submitCliCommand: {
        value: string;
        isVisibleCommandUi: boolean;
    };
    setSubmitCliCommand: React.Dispatch<
        React.SetStateAction<submitCliCommandType>
    >;
    isVisibleCommandPalette: boolean;
    setIsVisibleCommandPalette: React.Dispatch<React.SetStateAction<boolean>>;
    toggleCommandPalette: () => void;
}

export const KeyboardContext = createContext<KeyboardContextProps>({
    isVisibleKeyboardInfo: false,
    setIsVisibleKeyboardInfo: () => { },
    toggleKeyboardInfo: () => { },
    submitCliCommand: { value: "", isVisibleCommandUi: false },
    setSubmitCliCommand: () => { },
    isVisibleCommandPalette: false,
    setIsVisibleCommandPalette: () => { },
    toggleCommandPalette: () => { },
});
