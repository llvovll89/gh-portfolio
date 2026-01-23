import {useEffect, useState} from "react";

export const useCheckedMobileSize = () => {
    const [isMobileSize, setIsMobileSize] = useState<boolean>(() => {
        if (typeof window === "undefined") return false;
        return window.innerWidth <= 564;
    });

    useEffect(() => {
        const checkMobileSize = () => {
            setIsMobileSize(window.innerWidth <= 564); // 564px 이하를 모바일로 간주
        };

        window.addEventListener("resize", checkMobileSize);
        return () => {
            window.removeEventListener("resize", checkMobileSize);
        };
    }, []);

    return isMobileSize;
};
