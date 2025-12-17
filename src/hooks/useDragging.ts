import {useContext, useEffect, useRef} from "react";
import {GlobalStateContext} from "../context/GlobalState.context";

interface UseDraggingProps {
    targetRef: React.RefObject<HTMLDivElement | null>;
    type: "sidebar" | "footer";
}

export const useDragging = ({targetRef, type}: UseDraggingProps) => {
    const {setLayoutState} = useContext(GlobalStateContext);
    const isDragging = useRef(false);

    const handleMouseDown = (e: React.MouseEvent) => {
        isDragging.current = true;
        if (targetRef && targetRef.current) {
            targetRef.current.style.cursor = "ns-resize";
        }
    };

    const handleMouseMove = (e: MouseEvent) => {
        if (!isDragging.current) return;

        const windowHeight = window.innerHeight;
        const newHeight = windowHeight - e.clientY;

        if (type === "sidebar") {
            if (e.clientX > 600) return; // 최대 너비 600px

            setLayoutState((prev) => ({
                ...prev,
                resizeSidebarWidth: Math.max(50, e.clientX), // 최소 너비 100px
            }));
        } else if (type === "footer") {
            setLayoutState((prev) => ({
                ...prev,
                resizeFooterHeight: Math.max(50, newHeight), // 최소 높이 50px
            }));
        }
    };

    const handleMouseUp = () => {
        isDragging.current = false;
        if (targetRef && targetRef.current) {
            targetRef.current.style.cursor = "";
        }
    };

    useEffect(() => {
        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("mouseup", handleMouseUp);
        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseup", handleMouseUp);
        };
    }, []);

    return handleMouseDown;
};
