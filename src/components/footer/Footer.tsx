import { useContext, useRef } from "react";
import { GlobalStateContext } from "../../context/GlobalState.context";
import { useDragging } from "../../hooks/useDragging";
import { Cli } from "./cli/Cli";

export const Bottom = () => {
    const { layoutState } = useContext(GlobalStateContext);
    const footerRef = useRef<HTMLDivElement>(null);

    const handleMouseDown = useDragging({ targetRef: footerRef, type: "footer" });

    return (
        <footer
            ref={footerRef}
            className={` bg-base-navy absolute bottom-0 right-0 border-t border-sub-gary/30 transition-transform ease-in-out`}
            style={{
                width: `calc(100% - ${layoutState.resizeSidebarWidth}px)`,
                height: layoutState.resizeFooterHeight,
            }}
        >
            <header className="select-none text-sub-gary text-xs w-full h-8 flex items-center gap-2 px-3">
                <span className="border-b border-primary">TERMINAL</span>
            </header>

            <Cli />

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
