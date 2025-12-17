import {Link} from "react-router-dom";
import {MAIN, NOT_FOUND, routesPath} from "../../routes/route";
import {useContext} from "react";
import {GlobalStateContext} from "../../context/GlobalState.context";

export const Header = () => {
    const {selectedPath, setSelectedPath, layoutState} =
        useContext(GlobalStateContext);

    const selectedStyle = (path: string) => {
        return {
            bgColor: selectedPath === path ? "bg-primary/30" : "",
        };
    };

    return (
        <header
            className={`absolute top-0 right-0 h-10 bg-main border-b border-sub-gary/30 flex items-center`}
            style={{width: `calc(100% - ${layoutState.resizeSidebarWidth}px)`}}
        >
            <ul className={`w-full flex items-center h-full`}>
                {routesPath
                    .filter((r) => r.path !== NOT_FOUND)
                    .map((r) => (
                        <li
                            onClick={() => setSelectedPath(r.path)}
                            key={r.path}
                            className={`${selectedStyle(r.path).bgColor} min-w-30 w-max h-full border-r text-white border-sub-gary/30 text-[13px] flex items-center cursor-pointer user-select-none`}
                        >
                            <Link
                                to={r.path}
                                className="flex items-center gap-0.5 w-full h-full justify-center relative"
                            >
                                <span className="absolute left-2">📍</span>
                                <span className="h-full flex items-center">
                                    {r.name}.tsx
                                </span>
                            </Link>
                        </li>
                    ))}
            </ul>
        </header>
    );
};
