import { useContext } from "react";
import { GlobalStateContext } from "../../context/GlobalState.context";
import { convertThemeTextColor } from "../../utils/convertThemeTextColor";

interface ContentsProps {
    children?: React.ReactNode;
    className?: string;
}

export const Contents = ({ children, className }: ContentsProps) => {
    const { layoutState, selectedTheme } = useContext(GlobalStateContext);

    return (
        <section
            className={`absolute top-10 right-0 p-3 flex flex-col transition-width ${className} transition-transform ease-in-out ${selectedTheme.mode} ${convertThemeTextColor(selectedTheme.mode)}`}
            style={{
                width: `calc(100% - ${layoutState.resizeSidebarWidth}px)`,
                height: `calc(100% - ${layoutState.resizeFooterHeight + 40
                    }px)`,
            }}
        >
            {children}
        </section>
    );
};
