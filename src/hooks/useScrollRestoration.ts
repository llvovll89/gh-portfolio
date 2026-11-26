import { useEffect, type RefObject } from "react";
import { useLocation } from "react-router-dom";
import { useCheckedMobileSize } from "./useCheckedMobileSize";

const STORAGE_KEY = "portfolio-scroll-positions";

// 세션 동안 메모리에 유지하고, 첫 사용 시 한 번만 저장소에서 읽음
let positions: Record<string, number> | null = null;
function loadPositions(): Record<string, number> {
    if (positions) return positions;
    positions = {};
    try {
        const parsed: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}");
        if (parsed && typeof parsed === "object") {
            for (const [key, value] of Object.entries(parsed)) {
                if (typeof value === "number" && Number.isFinite(value)) positions[key] = value;
            }
        }
    } catch {
        // 저장소 차단·파싱 오류는 무시
    }
    return positions;
}

/**
 * 페이지별 스크롤 위치 저장·복원.
 * 스크롤 컨테이너를 가진 컴포넌트(Contents) 안에서 호출해야 lazy 라우트가 실제로 mount 된 뒤 동작함
 * (App 에서 getElementById 로 찾으면 첫 진입 시 Suspense fallback 단계라 요소가 없어 복원·기록이 모두 빠짐)
 */
export function useScrollRestoration(containerRef: RefObject<HTMLElement | null>) {
    const { pathname } = useLocation();
    const isMobile = useCheckedMobileSize();
    const key = `v2:${isMobile ? "mobile" : "desktop"}:${pathname}`;

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;
        const store = loadPositions();

        // 스크롤 중에는 메모리만 갱신하고, 저장은 스크롤이 멈춘 뒤·라우트 이탈·페이지 숨김 시점에만 수행
        let persistTimer: ReturnType<typeof setTimeout> | undefined;
        const persist = () => {
            clearTimeout(persistTimer);
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
            } catch {
                // 저장소 차단 환경에서는 무시
            }
        };
        const handleScroll = () => {
            store[key] = container.scrollTop;
            clearTimeout(persistTimer);
            persistTimer = setTimeout(persist, 300);
        };

        container.scrollTop = store[key] ?? 0;
        container.addEventListener("scroll", handleScroll, { passive: true });
        window.addEventListener("pagehide", persist);
        return () => {
            container.removeEventListener("scroll", handleScroll);
            window.removeEventListener("pagehide", persist);
            persist();
        };
    }, [containerRef, key]);
}
