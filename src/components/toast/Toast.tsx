import { useToast } from "@/context/ToastContext";
import type { ToastType } from "@/context/ToastContext";
import { HiCheckCircle, HiXCircle, HiExclamation, HiInformationCircle } from "react-icons/hi";

const icons: Record<ToastType, React.ReactNode> = {
    success: <HiCheckCircle className="w-4 h-4 shrink-0" />,
    error: <HiXCircle className="w-4 h-4 shrink-0" />,
    warning: <HiExclamation className="w-4 h-4 shrink-0" />,
    info: <HiInformationCircle className="w-4 h-4 shrink-0" />,
};

const colors: Record<ToastType, string> = {
    success: "bg-primary text-white shadow-primary/20",
    error: "bg-rose-500 text-white shadow-rose-500/20",
    warning: "bg-amber-500 text-white shadow-amber-500/20",
    info: "bg-blue-500 text-white shadow-blue-500/20",
};

export const Toast = () => {
    const { toasts } = useToast();

    if (toasts.length === 0) return null;

    return (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[9999] flex flex-col gap-2 items-center pointer-events-none">
            {toasts.map((toast) => (
                <div
                    key={toast.id}
                    role="alert"
                    aria-live="polite"
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl shadow-xl text-sm font-medium animate-in slide-in-from-top duration-200 ${colors[toast.type]}`}
                >
                    {icons[toast.type]}
                    {toast.msg}
                </div>
            ))}
        </div>
    );
};
