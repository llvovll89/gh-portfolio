import {useContext} from "react";
import {GlobalStateContext} from "../context/GlobalState.context";

export const useHandlePushPath = () => {
    const {setSelectedPathState} = useContext(GlobalStateContext);

    const handlePushPath = (path: string) => {
        setSelectedPathState((prev) => ({
            ...prev,
            state: path,
            list: [...new Set([...prev.list, path])],
        }));
    };

    return handlePushPath;
};
