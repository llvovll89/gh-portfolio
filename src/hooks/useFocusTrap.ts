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
        const previousFocus = document.activeElement as HTMLElement | null;
        const getControls = () => Array.from(container.querySelectorAll<HTMLElement>(
            'button:not(:disabled), a[href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])',
        )).filter(element => element.getClientRects().length > 0);

        const handleTabKey = (e: KeyboardEvent) => {
            if (e.key !== "Tab") return;
            const controls = getControls();
            const firstElement = controls[0];
            const lastElement = controls[controls.length - 1];
            if (!firstElement) { e.preventDefault(); container.focus(); return; }

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
                    getControls()[0]?.focus();
                }
            }
        };

        container.addEventListener("keydown", handleTabKey);

        // 모달이 열릴 때 첫 번째 요소에 포커스
        getControls()[0]?.focus();

        return () => {
            container.removeEventListener("keydown", handleTabKey);
            queueMicrotask(() => { if (previousFocus?.isConnected) previousFocus.focus(); });
        };
    }, [isActive]);

    return containerRef;
};
