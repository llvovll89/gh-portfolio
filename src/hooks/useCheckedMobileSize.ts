import {useEffect, useState} from "react";

export const useCheckedMobileSize = () => {
    const [isMobileSize, setIsMobileSize] = useState<boolean>(false);

    useEffect(() => {
        const checkMobileSize = () => {
            setIsMobileSize(window.innerWidth <= 564); // 일단 564px 이하를 모바일 사이즈로 간주
        };

        checkMobileSize(); // 첫 렌더링 체크

        window.addEventListener("resize", checkMobileSize);

        return () => {
            window.removeEventListener("resize", checkMobileSize);
        };
    }, []);

    return isMobileSize;
};
