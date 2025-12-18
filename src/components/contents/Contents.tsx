import {useContext} from "react";
import {GlobalStateContext} from "../../context/GlobalState.context";

interface ContentsProps {
    children?: React.ReactNode;
    className?: string;
}

export const Contents = ({children, className}: ContentsProps) => {
    const {layoutState} = useContext(GlobalStateContext);

    return (
        <section
            className={`absolute top-10 right-0 transition-width ${className} transition-transform ease-in-out`}
            style={{
                width: `calc(100% - ${layoutState.resizeSidebarWidth}px)`,
                height: `calc(100% - ${
                    layoutState.resizeFooterHeight + 40
                }px)`,
            }}
        >
            {children}
        </section>
    );
};
