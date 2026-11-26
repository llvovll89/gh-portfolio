import { useContext } from "react";
import { NavigationContext } from "../context/NavigationContext";
import { useNavigate } from "react-router-dom";

export const useHandlePushPath = () => {
    const { setSelectedPathState } = useContext(NavigationContext);
    const navigate = useNavigate();

    const handlePushPath = (rawPath: string) => {
        // 한글·공백 slug 는 location.pathname(퍼센트 인코딩)과 같은 형태로 맞춰야 Header 가 같은 탭으로 인식 (중복 탭 방지)
        const url = new URL(rawPath, window.location.origin);
        const path = url.pathname;
        setSelectedPathState((prev) => ({
            ...prev,
            state: path,
            list: [...new Set([...prev.list, path])],
        }));

        // Aside를 닫지 않고 유지
        // 북마크 경로의 쿼리·해시는 이동에만 쓰고 탭 키는 pathname 기준
        void navigate(path + url.search + url.hash);
    };

    return handlePushPath;
};
