import { Link } from "react-router-dom";
import { routesPath } from "../../routes/route";
import { useContext } from "react";
import { GlobalStateContext } from "../../context/GlobalState.context";

export const Header = () => {
    const { layoutState, selectedPathState, setSelectedPathState } =
        useContext(GlobalStateContext);

    const selectedStyle = (path: string) => {
        return {
            bgColor: selectedPathState.state === path ? "bg-sub-gary/20" : "",
        };
    };

    const handleClosePAth = (path: string) => {
        setSelectedPathState((prev) => {
            const idx = prev.list.indexOf(path);
            const newList = prev.list.filter((p) => p !== path);

            if (prev.state !== path) {
                return {
                    ...prev,
                    list: newList,
                };
            }

            let newState: string | undefined;

            if (newList.length === 0) {
                newState = undefined;
            } else if (idx > 0) {
                newState = newList[idx - 1]; // 왼쪽
            } else {
                newState = newList[0]; // 오른쪽
            }

            return {
                ...prev,
                list: newList,
                state: newState,
            };
        });
    };

    return (
        <header
            className={`absolute top-0 right-0 h-10 bg-base-navy border-b border-sub-gary/30 flex items-center`}
            style={{ width: `calc(100% - ${layoutState.resizeSidebarWidth}px)` }}
        >
            <ul className={`w-full flex items-center h-full`}>
                {selectedPathState.list.map((path) => {
                    const route = routesPath.find((r) => r.path === path);
                    if (!route) return null;
                    return (
                        <li
                            onClick={() =>
                                setSelectedPathState((prev) => ({
                                    ...prev,
                                    state: route.path,
                                }))
                            }
                            key={route.path}
                            className={`${selectedStyle(route.path).bgColor
                                } min-w-30 w-max h-full border-r text-white border-sub-gary/30 text-[13px] flex items-center cursor-pointer user-select-none gap-1 justify-center`}
                        >
                            <span className="">📍</span>
                            <Link to={route.path} className="h-full">
                                <span className="h-full flex items-center">
                                    {route.name}.tsx
                                </span>
                            </Link>

                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleClosePAth(route.path);
                                }}
                                className="h-full w-4 cursor-pointer"
                            >
                                <span className="text-white text-xs">X</span>
                            </button>
                        </li>
                    );
                })}
            </ul>
        </header>
    );
};
