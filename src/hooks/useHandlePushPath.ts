import { useContext } from "react";
import { GlobalStateContext } from "../context/GlobalState.context";
import { useNavigate } from "react-router-dom";

export const useHandlePushPath = () => {
    const { setSelectedPathState, setSelectedNav } = useContext(GlobalStateContext);
    const navigate = useNavigate();

    const handlePushPath = (path: string) => {
        setSelectedPathState((prev) => ({
            ...prev,
            state: path,
            list: [...new Set([...prev.list, path])],
        }));

        setSelectedNav(null);
        navigate(path);
    };

    return handlePushPath;
};
