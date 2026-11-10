import { useState, useCallback, useMemo } from "react";
import { KeyboardContext, type submitCliCommandType } from "./KeyboardState";

export const KeyboardProvider = ({ children }: { children: React.ReactNode }) => {
    const [isVisibleKeyboardInfo, setIsVisibleKeyboardInfo] =
        useState<boolean>(false);
    const [submitCliCommand, setSubmitCliCommand] =
        useState<submitCliCommandType>({ value: "", isVisibleCommandUi: false });
    const [isVisibleCommandPalette, setIsVisibleCommandPalette] =
        useState<boolean>(false);

    const toggleKeyboardInfo = useCallback(() => {
        setIsVisibleKeyboardInfo((prev) => !prev);
    }, []);

    const toggleCommandPalette = useCallback(() => {
        setIsVisibleCommandPalette((prev) => !prev);
    }, []);

    const value = useMemo(() => ({
        isVisibleKeyboardInfo,
        setIsVisibleKeyboardInfo,
        toggleKeyboardInfo,
        submitCliCommand,
        setSubmitCliCommand,
        isVisibleCommandPalette,
        setIsVisibleCommandPalette,
        toggleCommandPalette,
    }), [isVisibleKeyboardInfo, toggleKeyboardInfo, submitCliCommand, isVisibleCommandPalette, toggleCommandPalette]);

    return (
        <KeyboardContext.Provider value={value}>
            {children}
        </KeyboardContext.Provider>
    );
};
