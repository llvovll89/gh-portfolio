import { useSyncExternalStore } from "react";

// Tailwind sm breakpoint(640px) 미만을 모바일로 간주 — 모든 컴포넌트가 하나의 MediaQueryList 를 공유
const MOBILE_QUERY = "(max-width: 639.98px)";
const mediaQuery = typeof window !== "undefined" && typeof window.matchMedia === "function"
    ? window.matchMedia(MOBILE_QUERY)
    : null;

const subscribe = (onChange: () => void) => {
    mediaQuery?.addEventListener("change", onChange);
    return () => mediaQuery?.removeEventListener("change", onChange);
};

const getSnapshot = () => mediaQuery?.matches ?? false;
const getServerSnapshot = () => false;

export const useCheckedMobileSize = () => useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
