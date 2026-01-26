import {useMemo} from "react";

const isMobileUserAgent = (ua: string) =>
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);

type Options = {
    /**
     * UA 외에 pointer:coarse(터치 위주 기기)도 모바일로 볼지 여부
     * 기본값: true
     */
    includeCoarsePointer?: boolean;
};

export const useCheckedMobile = (options: Options = {}) => {
    const {includeCoarsePointer = true} = options;

    return useMemo(() => {
        if (typeof window === "undefined") return false;

        const ua =
            typeof navigator !== "undefined" ? (navigator.userAgent ?? "") : "";

        if (isMobileUserAgent(ua)) return true;

        if (includeCoarsePointer && typeof window.matchMedia === "function") {
            // iPadOS / 일부 태블릿 등 UA가 애매한 케이스 보완
            if (window.matchMedia("(pointer: coarse)").matches) return true;
        }

        return false;
    }, [includeCoarsePointer]);
};
