import { useState, useCallback, useMemo } from "react";
import { ToastContext, type ToastState, type ToastType } from "./ToastState";
let nextId = 0;

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
    const [toasts, setToasts] = useState<ToastState[]>([]);

    const showToast = useCallback((msg: string, type: ToastType = 'success') => {
        const id = ++nextId;
        setToasts((prev) => [...prev, { id, msg, type }]);
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, type === "error" ? 8000 : 5000);
    }, []);

    const value = useMemo(() => ({ toasts, showToast }), [toasts, showToast]);

    return (
        <ToastContext.Provider value={value}>
            {children}
        </ToastContext.Provider>
    );
};
