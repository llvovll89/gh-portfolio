import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/** Wait for lazy routes to commit before moving keyboard focus to the new content. */
export function useRouteFocus() {
    const { pathname } = useLocation();
    useEffect(() => {
        let done = false;
        let frame = 0;
        const focus = () => {
            if (done) return;
            const main = document.getElementById("main-content") ?? document.getElementById("detail-content");
            if (!main || !main.getClientRects().length || main.hasAttribute("data-route-loading")) return;
            done = true;
            main.focus({ preventScroll: true });
            observer.disconnect();
        };
        const observer = new MutationObserver(() => { cancelAnimationFrame(frame); frame = requestAnimationFrame(focus); });
        observer.observe(document.getElementById("root") ?? document.body, { childList: true, subtree: true });
        frame = requestAnimationFrame(focus);
        return () => { observer.disconnect(); cancelAnimationFrame(frame); };
    }, [pathname]);
}
