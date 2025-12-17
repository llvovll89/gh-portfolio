import {createContext, useState} from "react";

interface KeyboardContextProps {
    isVisibleKeyboardInfo: boolean;
    setIsVisibleKeyboardInfo: React.Dispatch<React.SetStateAction<boolean>>;
    toggleKeyboardInfo: () => void;
}

export const KeyboardContext = createContext<KeyboardContextProps>({
    isVisibleKeyboardInfo: false,
    setIsVisibleKeyboardInfo: () => {},
    toggleKeyboardInfo: () => {},
});

export const KeyboardProvider = ({children}: {children: React.ReactNode}) => {
    const [isVisibleKeyboardInfo, setIsVisibleKeyboardInfo] =
        useState<boolean>(false);

    const toggleKeyboardInfo = () => {
        setIsVisibleKeyboardInfo((prev) => !prev);
    };

    return (
        <KeyboardContext.Provider
            value={{
                isVisibleKeyboardInfo,
                setIsVisibleKeyboardInfo,
                toggleKeyboardInfo,
            }}
        >
            {children}
        </KeyboardContext.Provider>
    );
};
