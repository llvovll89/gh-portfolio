import { useContext } from "react";
import { GlobalStateContext } from "../context/GlobalState.context";
import { useNavigate } from "react-router-dom";
import { useCheckedMobileSize } from "./useCheckedMobileSize";

export const useHandlePushPath = () => {
    const { setSelectedPathState, setSelectedNav } = useContext(GlobalStateContext);
    const navigate = useNavigate();
    const isMobileSize = useCheckedMobileSize();

    const handlePushPath = (path: string) => {
        setSelectedPathState((prev) => ({
            ...prev,
            state: path,
            list: [...new Set([...prev.list, path])],
        }));

        // 모바일 환경에서만 Aside를 닫음
        if (isMobileSize) {
            setSelectedNav(null);
        }
        navigate(path);
    };

    return handlePushPath;
};
