import { useEffect } from "react";

interface UseClosePopupProps {
    elementRef: React.RefObject<HTMLDivElement | null>;
    callBack: () => void;
}

export const useClosePopup = ({ elementRef, callBack }: UseClosePopupProps) => {
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                elementRef.current &&
                !elementRef.current.contains(event.target as Node)
            ) {
                callBack();
            };
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);
};