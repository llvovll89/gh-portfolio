import type { ErrorInfo } from "react";
import type { Metric } from "web-vitals";
import { logger } from "./logger";

type SentryModule = typeof import("./sentryClient");
type PendingError = { error: unknown; componentStack?: string };

const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN?.trim();
const MAX_PENDING = 20;

let sentry: SentryModule | null = null;
const pending: PendingError[] = [];

/** 첫 화면을 막지 않도록 load 이후 브라우저가 한가할 때 실행 */
function whenIdle(task: () => void) {
    // Safari 일부 버전은 requestIdleCallback 미지원 → setTimeout 대체
    const run = () => (typeof window.requestIdleCallback === "function" ? window.requestIdleCallback(task, { timeout: 5000 }) : window.setTimeout(task, 2000));
    if (document.readyState === "complete") run();
    else window.addEventListener("load", run, { once: true });
}

/**
 * 에러 보고 단일 진입점 — Sentry SDK 가 아직 로드 전이면 대기열에 쌓았다가 초기화 직후 전송.
 * DSN 이 없으면(로컬·미설정) 아무것도 하지 않음
 */
export function reportError(error: unknown, componentStack?: string) {
    if (sentry) {
        if (componentStack) sentry.captureReactException(error, { componentStack });
        else sentry.captureException(error);
        return;
    }
    if (SENTRY_DSN && pending.length < MAX_PENDING) pending.push({ error, componentStack });
}

/** React 19 createRoot 의 onUncaughtError·onCaughtError — 기본 콘솔 출력은 유지하고 Sentry 로도 보고 */
export const reactRootErrorHandler = (label: string) => (error: unknown, errorInfo: ErrorInfo) => {
    console.error(`[${label}]`, error);
    reportError(error, errorInfo.componentStack ?? undefined);
};

/**
 * Sentry 초기화 (에러 수집만 — 성능 추적·세션 리플레이 미사용).
 * SDK(~30KB gzip)는 동적 import 로 첫 화면 이후에 받고, 그 전에 난 전역 에러는 직접 잡아 대기열로 넘김
 */
function initSentry() {
    if (!SENTRY_DSN || import.meta.env.DEV) return;

    const onError = (event: ErrorEvent) => reportError(event.error ?? event.message);
    const onRejection = (event: PromiseRejectionEvent) => reportError(event.reason);
    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onRejection);

    whenIdle(() => {
        import("./sentryClient")
            .then((module) => {
                module.init({
                    dsn: SENTRY_DSN,
                    // Vercel 이 Vite 빌드에 주입하는 시스템 변수 (production / preview), 없으면 빌드 모드
                    environment: import.meta.env.VITE_VERCEL_ENV ?? import.meta.env.MODE,
                    release: import.meta.env.VITE_VERCEL_GIT_COMMIT_SHA,
                    // v11 기본값은 사용자 정보·쿠키·헤더·본문까지 수집하므로 포트폴리오 방문자 개인정보는 보내지 않음
                    dataCollection: { userInfo: false, cookies: false, httpHeaders: false, httpBodies: [] },
                });
                // 이후 전역 에러는 SDK 가 직접 수집하므로 임시 리스너 제거 후 대기열 전송
                window.removeEventListener("error", onError);
                window.removeEventListener("unhandledrejection", onRejection);
                sentry = module;
                for (const item of pending.splice(0)) reportError(item.error, item.componentStack);
            })
            .catch((error: unknown) => logger.warn("Sentry 로드 실패", error));
    });
}

/**
 * Core Web Vitals(LCP·INP·CLS) 실사용자 측정값을 GA4 이벤트로 전송 (web-vitals 공식 권장 형식).
 * 버퍼링된 PerformanceObserver 를 쓰므로 load 이후 등록해도 초기 지표가 누락되지 않음
 */
function initWebVitals() {
    whenIdle(() => {
        import("web-vitals")
            .then(({ onCLS, onINP, onLCP }) => {
                // SPA 라 지표는 최초 진입 페이지 기준 — 보고 시점(탭 숨김)의 경로가 아닌 진입 경로를 함께 기록
                const landingPage = window.location.pathname;
                const send = ({ name, delta, value, id, rating }: Metric) => {
                    window.gtag?.("event", name, {
                        value: delta, // 합산 가능하도록 delta 사용
                        metric_id: id,
                        metric_value: value,
                        metric_delta: delta,
                        metric_rating: rating,
                        landing_page: landingPage,
                    });
                };
                onCLS(send);
                onINP(send);
                onLCP(send);
            })
            .catch((error: unknown) => logger.warn("web-vitals 로드 실패", error));
    });
}

export function initMonitoring() {
    initSentry();
    initWebVitals();
}
