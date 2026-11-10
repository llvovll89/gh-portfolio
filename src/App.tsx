import { useRouteFocus } from "./hooks/useRouteFocus";
import { useTranslation } from "react-i18next";
import {Route, Routes, useLocation} from "react-router-dom";
import {Suspense, useEffect, useLayoutEffect, useRef} from "react";
import {GlobalStateProvider} from "./context/GlobalState.context";
import {TerminalContext} from "./context/TerminalState";
import {KeyboardProvider} from "./context/KeyboardState.context";
import {routesPath} from "./routes/route";
import {AppChildContainer} from "./components/appChildContainer/AppChildContainer";
import {Bottom} from "./components/footer/Footer";
import {useCheckedMobileSize} from "./hooks/useCheckedMobileSize";
import {usePageTracking} from "./hooks/usePageTracking";
import {useContext} from "react";
import {SkipLinks} from "./components/skipLinks/SkipLinks";
import {RouteLoading} from "./components/loading/RouteLoading";
import {PWAUpdateBanner} from "./components/pwa/PWAUpdateBanner";
import {PWAInstallBanner} from "./components/pwa/PWAInstallBanner";
import {PageErrorBoundary} from "./components/error/PageErrorBoundary";
import {Toast} from "./components/toast/Toast";
import {StatusBar} from "./components/statusBar/StatusBar";
import {useThemeStyle} from "./hooks/useThemeStyle";

// Suspense 경계 안에 두어 lazy 라우트가 실제로 커밋된 뒤에만 프리렌더 콘텐츠를 제거 (페인트 전 교체)
function PrerenderedContentCleanup() {
    useLayoutEffect(() => {
        document.getElementById("seo-content")?.remove();
    }, []);
    return null;
}

function AppContent() {
    useTranslation();
    const isMobile = useCheckedMobileSize();
    const {backgroundClass, backgroundStyle} = useThemeStyle();
    const location = useLocation();
    const scrollPositionKey = `v2:${isMobile ? "mobile" : "desktop"}:${location.pathname}`;
    usePageTracking();
    useRouteFocus();
    const scrollPositionsRef = useRef<Record<string, number>>({});
    const isBlogDetailPage =
        location.pathname.startsWith("/blog/") &&
        location.pathname !== "/blog/";
    const {isTerminalVisible} = useContext(TerminalContext);

    useEffect(() => {
        try {
            const stored = localStorage.getItem("portfolio-scroll-positions");
            if (!stored) return;
            const parsed: unknown = JSON.parse(stored);
            if (parsed && typeof parsed === "object") {
                const nextPositions: Record<string, number> = {};
                for (const [key, value] of Object.entries(parsed)) {
                    if (typeof value === "number" && Number.isFinite(value)) {
                        nextPositions[key] = value;
                    }
                }
                scrollPositionsRef.current = nextPositions;
            }
        } catch {
            // ignore storage parsing errors
        }
    }, []);

    useEffect(() => {
        const container = document.getElementById("main-content");
        if (!container) return;

        // 스크롤 중에는 메모리만 갱신하고, 저장은 스크롤이 멈춘 뒤·라우트 이탈·페이지 숨김 시점에만 수행
        let persistTimer: ReturnType<typeof setTimeout> | undefined;
        const persist = () => {
            clearTimeout(persistTimer);
            try {
                localStorage.setItem(
                    "portfolio-scroll-positions",
                    JSON.stringify(scrollPositionsRef.current),
                );
            } catch {
                // ignore storage errors
            }
        };

        const handleScroll = () => {
            scrollPositionsRef.current[scrollPositionKey] = container.scrollTop;
            clearTimeout(persistTimer);
            persistTimer = setTimeout(persist, 300);
        };

        const saved = scrollPositionsRef.current[scrollPositionKey] ?? 0;
        container.scrollTop = saved;
        container.addEventListener("scroll", handleScroll, {passive: true});
        window.addEventListener("pagehide", persist);

        return () => {
            container.removeEventListener("scroll", handleScroll);
            window.removeEventListener("pagehide", persist);
            persist();
        };
    }, [scrollPositionKey]);

    return (
        <section
            className={`w-full min-h-dvh flex flex-col relative overflow-x-hidden overflow-y-auto ${backgroundClass}`}
            style={backgroundStyle}
        >
            <SkipLinks />
            <AppChildContainer />

            <Suspense fallback={<RouteLoading />}>
                <PrerenderedContentCleanup />
                <Routes>
                    {routesPath.map((r) => (
                        <Route
                            key={r.path}
                            path={r.path}
                            element={
                                <PageErrorBoundary pageName={r.name}>
                                    <div
                                        key={location.pathname}
                                        className="page-enter"
                                    >
                                        <r.component />
                                    </div>
                                </PageErrorBoundary>
                            }
                        />
                    ))}
                </Routes>
            </Suspense>

            {!isMobile && !isBlogDetailPage && isTerminalVisible && <Bottom />}
            {!isMobile && <StatusBar />}
            <PWAInstallBanner />
            <PWAUpdateBanner />
            <Toast />
        </section>
    );
}

function App() {
    return (
        <GlobalStateProvider>
            <KeyboardProvider>
                <PageErrorBoundary pageName="app">
                    <AppContent />
                </PageErrorBoundary>
            </KeyboardProvider>
        </GlobalStateProvider>
    );
}

export default App;
