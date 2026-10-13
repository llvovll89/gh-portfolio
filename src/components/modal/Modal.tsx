import { useEffect, type ReactNode, type RefObject } from "react";
import { Portal } from "../Portal";
import { useFocusTrap } from "../../hooks/useKeyboardNavigation";

interface Props { isOpen: boolean; onClose: () => void; children: ReactNode; ariaLabel?: string; initialFocusRef?: RefObject<HTMLElement | null>; closeOnBackdropClick?: boolean }
export const Modal = ({ isOpen, onClose, children, ariaLabel, initialFocusRef, closeOnBackdropClick = true }: Props) => {
    const ref = useFocusTrap(isOpen);
    useEffect(() => {
        if (!isOpen) return;
        const root = document.getElementById("root");
        const wasInert = root?.inert ?? false;
        const overflow = document.body.style.overflow;
        if (root) root.inert = true;
        document.body.style.overflow = "hidden";
        initialFocusRef?.current?.focus();
        return () => { if (root) root.inert = wasInert; document.body.style.overflow = overflow; };
    }, [isOpen, initialFocusRef]);
    if (!isOpen) return null;
    return <Portal><div className="fixed inset-0 z-50 flex items-center justify-center bg-inverse/50 p-4" onMouseDown={event => { if (closeOnBackdropClick && event.target === event.currentTarget) onClose(); }}>
        <div ref={ref} tabIndex={-1} role="dialog" aria-modal="true" aria-label={ariaLabel} className="max-h-[85dvh] w-full max-w-md overflow-y-auto rounded-xl border border-line bg-panel p-5 text-foreground shadow-xl" onKeyDown={event => { if (event.key === "Escape") { event.preventDefault(); event.stopPropagation(); onClose(); } }}>{children}</div>
    </div></Portal>;
};
export default Modal;
