import { useEffect } from "react";

/** Dialogs rendered in a Portal keep the underlying app out of keyboard and screen-reader navigation. */
export function useModalBackground(open: boolean) {
    useEffect(() => {
        if (!open) return;
        const root = document.getElementById("root");
        const previous = root?.inert ?? false;
        const overflow = document.body.style.overflow;
        if (root) root.inert = true;
        document.body.style.overflow = "hidden";
        return () => { if (root) root.inert = previous; document.body.style.overflow = overflow; };
    }, [open]);
}
