import {useContext} from "react";
import {GlobalStateContext} from "../../context/GlobalState.context";

export const Aside = () => {
    const {layoutState, setLayoutState} = useContext(GlobalStateContext);

    return (
        <aside
            className={`${
                layoutState.isVisibleSidebar ? "-translate-x-75" : ""
            } w-75 absolute left-0 top-0 h-screen transition-all ease-linear bg-main border-r border-sub-gary/30 flex flex-col z-1`}
        >
            <section className="flex flex-col bg-background-main-color">
                <header className="w-full h-8 px-2 flex items-center text-xs text-white">
                    EXPLORER
                </header>
                <article className="w-full h-[calc(100%-32px)]"></article>
            </section>

            <button
                className="absolute left-75 z-10 top-1/2 -translate-y-1/2 cursor-pointer bg-primary/50 rounded-tr-[5px] rounded-br-[5px] text-xl p-1"
                onClick={() =>
                    setLayoutState({
                        ...layoutState,
                        isVisibleSidebar: !layoutState.isVisibleSidebar,
                    })
                }
            >
                {layoutState.isVisibleSidebar ? "👉" : "👈"}
            </button>
        </aside>
    );
};
