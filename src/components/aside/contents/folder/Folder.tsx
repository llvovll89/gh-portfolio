import { FcOpenedFolder } from "react-icons/fc";
import { NOT_FOUND, routesPath } from "../../../../routes/route";
import { useContext } from "react";
import { GlobalStateContext } from "../../../../context/GlobalState.context";
import { useHandlePushPath } from "../../../../hooks/useHandlePushPath";

export const Folder = () => {
    const { selectedPathState } = useContext(GlobalStateContext);
    const handlePushPath = useHandlePushPath();

    return (
        <section className="w-[calc(100%-40px)] flex flex-col bg-base-navy overflow-hidden">
            <header className="w-full h-10 px-3 flex items-center text-xs text-white overflow-hidden tracking-[1px]">
                탐색기
            </header>

            <ul className="w-full h-[calc(100%-40px)]">
                {routesPath
                    .filter((r) => r.path !== NOT_FOUND)
                    .map((r) => (
                        <li
                            onClick={() => handlePushPath(r.path)}
                            key={r.path}
                            className={`${selectedPathState.state === r.path
                                ? "bg-sub-gary/20"
                                : ""
                                } w-full h-8 flex items-center px-3 text-white text-sm cursor-pointer hover:bg-primary/20 user-select-none gap-1`}
                        >
                            <FcOpenedFolder className="w-5 h-5" />
                            {r.name}
                        </li>
                    ))}
            </ul>
        </section>
    );
};
