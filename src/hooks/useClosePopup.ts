import { useEffect, useRef } from "react";

interface UseClosePopupProps {
    elementRef: React.RefObject<HTMLDivElement | null>;
    callBack: () => void;
}

export const useClosePopup = ({ elementRef, callBack }: UseClosePopupProps) => {
    // callBack을 ref로 유지 → 매 렌더마다 이벤트 리스너 재등록 없이 항상 최신 함수 참조
    const callBackRef = useRef(callBack);
    useEffect(() => {
        callBackRef.current = callBack;
    }, [callBack]);

    useEffect(() => {
        const handler = (e: MouseEvent | TouchEvent) => {
            if (
                elementRef.current &&
                !elementRef.current.contains(e.target as Node)
            ) {
                callBackRef.current();
            }
        };

        // 마우스 클릭 + 모바일 터치 모두 대응
        document.addEventListener("mousedown", handler);
        document.addEventListener("touchstart", handler, { passive: true });

        return () => {
            document.removeEventListener("mousedown", handler);
            document.removeEventListener("touchstart", handler);
        };
    }, []); // elementRef는 ref 객체라 안정적, callBack은 위 ref로 처리
};
