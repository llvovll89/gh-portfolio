import {useContext} from "react";
import {GlobalStateContext} from "../../context/GlobalState.context";
import {convertThemeTextColor} from "../../utils/convertThemeTextColor";

interface ContentsProps {
    children?: React.ReactNode;
    className?: string;
}

export const Contents = ({children, className}: ContentsProps) => {
    const {layoutState, selectedTheme} = useContext(GlobalStateContext);

    return (
        <section
            className={`absolute top-10 right-0 flex flex-col transition-width transition-transform ease-in-out overflow-auto scrolls min-h-0
                p-3 sm:p-4 md:p-6 ${className} ${selectedTheme.mode} ${convertThemeTextColor(selectedTheme.mode)}`}
            style={{
                width: `calc(100% - ${layoutState.resizeSidebarWidth}px)`,
                height: `calc(100% - ${layoutState.resizeFooterHeight + 40}px)`,
            }}
        >
            {children}
        </section>
    );
};
