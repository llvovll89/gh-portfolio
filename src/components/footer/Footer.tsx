import {useContext, useRef} from "react";
import {GlobalStateContext} from "../../context/GlobalState.context";
import {useDragging} from "../../hooks/useDragging";

export const Bottom = () => {
    const {layoutState} = useContext(GlobalStateContext);
    const footerRef = useRef<HTMLDivElement>(null);

    const handleMouseDown = useDragging({targetRef: footerRef, type: "footer"});

    return (
        <footer
            ref={footerRef}
            className={` bg-main absolute bottom-0 right-0 border-t border-sub-gary/30 transition-transform ease-in-out`}
            style={{
                width: `calc(100% - ${layoutState.resizeSidebarWidth}px)`,
                height: layoutState.resizeFooterHeight,
            }}
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
