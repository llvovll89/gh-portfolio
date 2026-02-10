import { useEffect, useState } from "react";

export const useCheckedMobileSize = () => {
    const [isMobileSize, setIsMobileSize] = useState<boolean>(() => {
        if (typeof window === "undefined") return false;
        return window.innerWidth < 640;
    });

    useEffect(() => {
        const checkMobileSize = () => {
            setIsMobileSize(window.innerWidth < 640); // 640px 미만을 모바일로 간주 (Tailwind sm breakpoint와 일치)
        };

        window.addEventListener("resize", checkMobileSize);
        return () => {
            window.removeEventListener("resize", checkMobileSize);
        };
    }, []);

    return isMobileSize;
};
