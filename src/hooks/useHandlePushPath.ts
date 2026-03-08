import { useContext } from "react";
import { NavigationContext } from "../context/NavigationContext";
import { useNavigate } from "react-router-dom";

export const useHandlePushPath = () => {
    const { setSelectedPathState } = useContext(NavigationContext);
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
