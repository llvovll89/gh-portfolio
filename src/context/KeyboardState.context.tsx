import { createContext, useState } from "react";

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

export const KeyboardProvider = ({ children }: { children: React.ReactNode }) => {
    const [isVisibleKeyboardInfo, setIsVisibleKeyboardInfo] =
        useState<boolean>(false);
    const [submitCliCommand, setSubmitCliCommand] =
        useState<submitCliCommandType>({ value: "", isVisibleCommandUi: false });
    const [isVisibleCommandPalette, setIsVisibleCommandPalette] =
        useState<boolean>(false);

    const toggleKeyboardInfo = () => {
        setIsVisibleKeyboardInfo((prev) => !prev);
    };

    const toggleCommandPalette = () => {
        setIsVisibleCommandPalette((prev) => !prev);
    };

    return (
        <KeyboardContext.Provider
            value={{
                isVisibleKeyboardInfo,
                setIsVisibleKeyboardInfo,
                toggleKeyboardInfo,
                submitCliCommand,
                setSubmitCliCommand,
                isVisibleCommandPalette,
                setIsVisibleCommandPalette,
                toggleCommandPalette,
            }}
        >
            {children}
        </KeyboardContext.Provider>
    );
};
