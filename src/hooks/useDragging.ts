import { useContext, useEffect, useRef } from "react";
import { GlobalStateContext } from "../context/GlobalState.context";

interface UseDraggingProps {
    targetRef: React.RefObject<HTMLDivElement | null>;
    type: "sidebar" | "footer";
}

type InputKind = "pointer" | "mouse" | "touch" | null;

export const useDragging = ({ targetRef, type }: UseDraggingProps) => {
    const { setLayoutState } = useContext(GlobalStateContext);

    const isDragging = useRef(false);
    const activeInput = useRef<InputKind>(null);

    const setCursor = (value: string) => {
        if (targetRef?.current) targetRef.current.style.cursor = value;
    };

    const getClient = (
        e: MouseEvent | PointerEvent | TouchEvent,
    ): { clientX: number; clientY: number } | null => {
        // TouchEvent
        if ("touches" in e) {
            const t = e.touches[0] ?? e.changedTouches[0];
            if (!t) return null;
            return { clientX: t.clientX, clientY: t.clientY };
        }
        // MouseEvent / PointerEvent
        return { clientX: e.clientX, clientY: e.clientY };
    };

    const applyDrag = (clientX: number, clientY: number) => {
        if (type === "sidebar") {
            if (clientX > 600) return; // 최대 너비 600px
            setLayoutState((prev) => ({
                ...prev,
                resizeSidebarWidth: Math.max(125, clientX), // 최소 너비 125px
            }));
            return;
        }

        // footer
        const windowHeight = window.innerHeight;
        const newHeight = windowHeight - clientY;

        setLayoutState((prev) => ({
            ...prev,
            resizeFooterHeight: Math.max(0, newHeight), // 최소 높이 100px
        }));
    };

    const handleStart = (
        e: React.MouseEvent | React.TouchEvent | React.PointerEvent,
    ) => {
        isDragging.current = true;

        // 어떤 입력으로 시작했는지 기록(중복 이벤트 방지)
        if (e.type === "pointerdown") activeInput.current = "pointer";
        else if (e.type === "touchstart") activeInput.current = "touch";
        else activeInput.current = "mouse";

        setCursor(type === "sidebar" ? "ew-resize" : "ns-resize");

        if ("pointerId" in e) {
            try {
                (e.currentTarget as HTMLElement).setPointerCapture?.(
                    e.pointerId,
                );
            } catch {
                // ignore
            }
        }
    };

    const handleMoveNative = (e: MouseEvent | PointerEvent | TouchEvent) => {
        if (!isDragging.current) return;

        // 입력 타입 섞여서 들어오는 중복 move 방지
        if (activeInput.current === "pointer" && e.type !== "pointermove")
            return;
        if (activeInput.current === "touch" && e.type !== "touchmove") return;
        if (activeInput.current === "mouse" && e.type !== "mousemove") return;

        // 터치는 스크롤 방지(리스너를 passive:false로 등록해야 동작)
        if (e.type === "touchmove") e.preventDefault?.();

        const pos = getClient(e);
        if (!pos) return;

        applyDrag(pos.clientX, pos.clientY);
    };

    const handleEndNative = () => {
        isDragging.current = false;
        activeInput.current = null;
        setCursor("");
    };

    useEffect(() => {
        // Pointer Events (권장)
        window.addEventListener("pointermove", handleMoveNative);
        window.addEventListener("pointerup", handleEndNative);
        window.addEventListener("pointercancel", handleEndNative);

        // Touch fallback (iOS 등)
        window.addEventListener("touchmove", handleMoveNative, {
            passive: false,
        });
        window.addEventListener("touchend", handleEndNative);
        window.addEventListener("touchcancel", handleEndNative);

        // Mouse fallback
        window.addEventListener("mousemove", handleMoveNative);
        window.addEventListener("mouseup", handleEndNative);

        return () => {
            window.removeEventListener("pointermove", handleMoveNative);
            window.removeEventListener("pointerup", handleEndNative);
            window.removeEventListener("pointercancel", handleEndNative);

            window.removeEventListener("touchmove", handleMoveNative as any);
            window.removeEventListener("touchend", handleEndNative);
            window.removeEventListener("touchcancel", handleEndNative);

            window.removeEventListener("mousemove", handleMoveNative);
            window.removeEventListener("mouseup", handleEndNative);
        };
    }, []);

    return handleStart;
};
