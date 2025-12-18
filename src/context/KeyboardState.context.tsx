import {createContext, useState} from "react";

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
}

export const KeyboardContext = createContext<KeyboardContextProps>({
    isVisibleKeyboardInfo: false,
    setIsVisibleKeyboardInfo: () => {},
    toggleKeyboardInfo: () => {},
    submitCliCommand: {value: "", isVisibleCommandUi: false},
    setSubmitCliCommand: () => {},
});

export const KeyboardProvider = ({children}: {children: React.ReactNode}) => {
    const [isVisibleKeyboardInfo, setIsVisibleKeyboardInfo] =
        useState<boolean>(false);
    const [submitCliCommand, setSubmitCliCommand] =
        useState<submitCliCommandType>({value: "", isVisibleCommandUi: false});

    const toggleKeyboardInfo = () => {
        setIsVisibleKeyboardInfo((prev) => !prev);
    };

    return (
        <KeyboardContext.Provider
            value={{
                isVisibleKeyboardInfo,
                setIsVisibleKeyboardInfo,
                toggleKeyboardInfo,
                submitCliCommand,
                setSubmitCliCommand,
            }}
        >
            {children}
        </KeyboardContext.Provider>
    );
};
