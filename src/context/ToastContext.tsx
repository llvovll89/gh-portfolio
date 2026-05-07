import { createContext, useState, useContext, useCallback } from "react";

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastState {
    id: number;
    msg: string;
    type: ToastType;
}

interface ToastContextProps {
    toasts: ToastState[];
    showToast: (msg: string, type?: ToastType) => void;
}

export const ToastContext = createContext<ToastContextProps>({
    toasts: [],
    showToast: () => {},
});

let nextId = 0;

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
    const [toasts, setToasts] = useState<ToastState[]>([]);

    const showToast = useCallback((msg: string, type: ToastType = 'success') => {
        const id = ++nextId;
        setToasts((prev) => [...prev, { id, msg, type }]);
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 3000);
    }, []);

    return (
        <ToastContext.Provider value={{ toasts, showToast }}>
            {children}
        </ToastContext.Provider>
    );
};

export const useToast = () => useContext(ToastContext);
