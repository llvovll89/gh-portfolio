import {useContext} from "react";
import {GlobalStateContext} from "../../context/GlobalState.context";

interface ContentsProps {
    children?: React.ReactNode;
    className?: string;
}

export const Contents = ({children, className}: ContentsProps) => {
    const {isVisibleSidebar} = useContext(GlobalStateContext);

    return (
        <section
            className={`${isVisibleSidebar ? "w-full translate-x-0" : "w-[calc(100%-300px)] translate-x-75"} absolute top-10 h-[calc(100%-290px)] transition-all ease-linear ${className}`}
        >
            {children}
        </section>
    );
};
