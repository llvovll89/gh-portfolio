import {useContext, useEffect, useRef} from "react";
import {GlobalStateContext} from "../../context/GlobalState.context";

export const Bottom = () => {
    const {layoutState, setLayoutState} = useContext(GlobalStateContext);
    const isDragging = useRef(false);
    const footerRef = useRef<HTMLDivElement>(null);

    const handleMouseDown = (e: React.MouseEvent) => {
        isDragging.current = true;
        footerRef.current!.style.cursor = "ns-resize";
    };

    const handleMouseMove = (e: MouseEvent) => {
        if (!isDragging.current) return;
        // 화면 아래에서부터의 높이 계산
        const windowHeight = window.innerHeight;
        const newHeight = windowHeight - e.clientY;
        setLayoutState((prev) => ({
            ...prev,
            resizeFooterHeight: Math.max(50, newHeight), // 최소 높이 50px
        }));
    };

    const handleMouseUp = () => {
        isDragging.current = false;
        footerRef.current!.style.cursor = "";
    };

    useEffect(() => {
        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("mouseup", handleMouseUp);

        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseup", handleMouseUp);
        };
    }, []);

    return (
        <footer
            ref={footerRef}
            className={`${
                layoutState.isVisibleSidebar ? "w-full" : "w-[calc(100%-300px)]"
            } bg-main absolute bottom-0 right-0 border-t border-sub-gary/30 transition-width ease-linear`}
            style={{height: layoutState.resizeFooterHeight || 250}}
        >
            <div
                style={{
                    height: 8,
                    cursor: "ns-resize",
                    background: "rgba(0,0,0,0.1)",
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    zIndex: 10,
                }}
                onMouseDown={handleMouseDown}
            />
        </footer>
    );
};
