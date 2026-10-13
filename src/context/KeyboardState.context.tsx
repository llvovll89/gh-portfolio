import { useState } from "react";
import { KeyboardContext, type submitCliCommandType } from "./KeyboardState";

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
