import {useContext} from "react";
import {GlobalStateContext} from "../../context/GlobalState.context";

interface ContentsProps {
    children?: React.ReactNode;
    className?: string;
}

export const Contents = ({children, className}: ContentsProps) => {
    const {layoutState} = useContext(GlobalStateContext);

    console.log(layoutState.resizeFooterHeight);

    return (
        <section
            className={`${
                layoutState.isVisibleSidebar
                    ? "w-full translate-x-0"
                    : "w-[calc(100%-300px)] translate-x-75"
            } absolute top-10 transition-width ${className}`}
            style={{
                height: `calc(100% - ${
                    layoutState.resizeFooterHeight || 250
                }px)`,
            }}
        >
            {children}
        </section>
    );
};
