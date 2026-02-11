import { useContext } from "react";
import { GlobalStateContext } from "../context/GlobalState.context";
import { useNavigate } from "react-router-dom";

export const useHandlePushPath = () => {
    const { setSelectedPathState } = useContext(GlobalStateContext);
    const navigate = useNavigate();

    const handlePushPath = (path: string) => {
        setSelectedPathState((prev) => ({
            ...prev,
            state: path,
            list: [...new Set([...prev.list, path])],
        }));

        // Aside를 닫지 않고 유지
        navigate(path);
    };

    return handlePushPath;
};
