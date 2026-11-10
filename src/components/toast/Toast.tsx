import { useToast } from "@/context/ToastState";
import type { ToastType } from "@/context/ToastState";
import { LuCircleCheck, LuCircleX, LuTriangleAlert, LuInfo } from "react-icons/lu";
import { Portal } from "@/components/Portal";

const icons: Record<ToastType, React.ReactNode> = {
    success: <LuCircleCheck aria-hidden="true" className="w-4 h-4 shrink-0 text-success" />,
    error: <LuCircleX aria-hidden="true" className="w-4 h-4 shrink-0 text-error" />,
    warning: <LuTriangleAlert aria-hidden="true" className="w-4 h-4 shrink-0 text-primary" />,
    info: <LuInfo aria-hidden="true" className="w-4 h-4 shrink-0 text-primary" />,
};

// 테마 표면 토큰 위에 본문색을 써서 모든 테마에서 4.5:1 이상 유지, 유형은 아이콘·좌측 바로 구분
const accents: Record<ToastType, string> = {
    success: "border-l-success",
    error: "border-l-error",
    warning: "border-l-primary",
    info: "border-l-primary",
};

export const Toast = () => {
    const { toasts } = useToast();

    // 라이브 리전은 항상 body 에 마운트 — 모달이 #root 를 inert 로 만들어도 낭독되도록
    return (
        <Portal>
            <div
                role="status"
                aria-live="polite"
                className="fixed z-[9999] flex flex-col gap-2 pointer-events-none bottom-20 inset-x-4 items-center sm:bottom-6 sm:inset-x-auto sm:right-6 sm:items-end"
            >
                {toasts.map((toast) => (
                    <div
                        key={toast.id}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border border-line border-l-4 bg-panel text-foreground shadow-xl text-sm font-medium max-w-sm whitespace-normal break-words animate-in slide-in-from-bottom duration-200 ${accents[toast.type]}`}
                    >
                        {icons[toast.type]}
                        {toast.msg}
                    </div>
                ))}
            </div>
        </Portal>
    );
};
