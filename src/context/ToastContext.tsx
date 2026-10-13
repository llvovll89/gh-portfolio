import { useState, useCallback } from "react";
import { ToastContext, type ToastState, type ToastType } from "./ToastState";
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
