import {useContext} from "react";
import {GlobalStateContext} from "../../context/GlobalState.context";

export const Bottom = () => {
    const {isVisibleSidebar} = useContext(GlobalStateContext);

    return (
        <footer
            className={`${
                isVisibleSidebar ? "w-full" : "w-[calc(100%-300px)]"
            } h-62.5 bg-main absolute bottom-0 right-0 border-t border-sub-gary/30 transition-all ease-linear`}
        ></footer>
    );
};
