import { createContext, useContext } from "react";

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastState {
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



export const useToast = () => useContext(ToastContext);
