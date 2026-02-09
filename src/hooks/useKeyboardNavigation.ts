import { useEffect, useRef } from "react";

/**
 * 포커스 트랩 훅
 * @description 모달이나 다이얼로그에서 Tab 키를 눌렀을 때 포커스가 모달 내부에만 머물도록 함
 * @param isActive 포커스 트랩 활성화 여부
 */
export const useFocusTrap = (isActive: boolean) => {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!isActive || !containerRef.current) return;

        const container = containerRef.current;
        const focusableElements = container.querySelectorAll<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        );
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        const handleTabKey = (e: KeyboardEvent) => {
            if (e.key !== "Tab") return;

            if (e.shiftKey) {
                // Shift + Tab
                if (document.activeElement === firstElement) {
                    e.preventDefault();
                    lastElement?.focus();
                }
            } else {
                // Tab
                if (document.activeElement === lastElement) {
                    e.preventDefault();
                    firstElement?.focus();
                }
            }
        };

        container.addEventListener("keydown", handleTabKey);

        // 모달이 열릴 때 첫 번째 요소에 포커스
        firstElement?.focus();

        return () => {
            container.removeEventListener("keydown", handleTabKey);
        };
    }, [isActive]);

    return containerRef;
};

/**
 * 화살표 키 네비게이션 훅
 * @description 목록에서 화살표 키로 항목 간 이동
 * @param itemCount 항목 개수
 * @param onSelect 선택 시 호출되는 함수
 * @param options 옵션 (순환 여부, 가로/세로)
 */
interface UseArrowNavigationOptions {
    loop?: boolean; // 순환 여부
    orientation?: "vertical" | "horizontal"; // 방향
    onEscape?: () => void; // ESC 키 핸들러
}

export const useArrowNavigation = (
    itemCount: number,
    onSelect?: (index: number) => void,
    options: UseArrowNavigationOptions = {},
) => {
    const { loop = false, orientation = "vertical", onEscape } = options;
    const selectedIndexRef = useRef(0);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        const currentIndex = selectedIndexRef.current;

        // 방향 키 처리
        const isUp =
            (orientation === "vertical" && e.key === "ArrowUp") ||
            (orientation === "horizontal" && e.key === "ArrowLeft");
        const isDown =
            (orientation === "vertical" && e.key === "ArrowDown") ||
            (orientation === "horizontal" && e.key === "ArrowRight");

        if (isUp) {
            e.preventDefault();
            if (currentIndex > 0) {
                selectedIndexRef.current = currentIndex - 1;
            } else if (loop) {
                selectedIndexRef.current = itemCount - 1;
            }
        } else if (isDown) {
            e.preventDefault();
            if (currentIndex < itemCount - 1) {
                selectedIndexRef.current = currentIndex + 1;
            } else if (loop) {
                selectedIndexRef.current = 0;
            }
        } else if (e.key === "Enter" && onSelect) {
            e.preventDefault();
            onSelect(selectedIndexRef.current);
        } else if (e.key === "Escape" && onEscape) {
            e.preventDefault();
            onEscape();
        }
    };

    const setSelectedIndex = (index: number) => {
        selectedIndexRef.current = index;
    };

    return {
        selectedIndex: selectedIndexRef.current,
        setSelectedIndex,
        handleKeyDown,
    };
};

/**
 * 포커스 가능한 요소들을 찾는 유틸리티
 */
export const getFocusableElements = (
    container: HTMLElement,
): NodeListOf<HTMLElement> => {
    return container.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
    );
};

/**
 * 다음 포커스 가능한 요소로 이동
 */
export const focusNextElement = (
    container: HTMLElement,
    reverse = false,
): boolean => {
    const elements = Array.from(getFocusableElements(container));
    const currentIndex = elements.findIndex((el) => el === document.activeElement);

    if (currentIndex === -1) {
        elements[0]?.focus();
        return true;
    }

    const nextIndex = reverse
        ? (currentIndex - 1 + elements.length) % elements.length
        : (currentIndex + 1) % elements.length;

    elements[nextIndex]?.focus();
    return true;
};

/**
 * 역순 Tab 네비게이션 (Shift + Tab)
 */
export const handleShiftTab = (
    e: React.KeyboardEvent,
    container: HTMLElement,
) => {
    if (e.key === "Tab" && e.shiftKey) {
        e.preventDefault();
        focusNextElement(container, true);
    }
};
