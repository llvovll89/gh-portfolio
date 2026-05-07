import { Route, Routes, useLocation } from "react-router-dom";
import { Suspense, useEffect, useRef } from "react";
import { GlobalStateProvider } from "./context/GlobalState.context";
import { TerminalContext } from "./context/TerminalContext";
import { KeyboardProvider } from "./context/KeyboardState.context";
import { routesPath } from "./routes/route";
import { AppChildContainer } from "./components/appChildContainer/AppChildContainer";
import { Bottom } from "./components/footer/Footer";
import { useCheckedMobile } from "./hooks/useCheckedMobile";
import { usePageTracking } from "./hooks/usePageTracking";
import { useContext } from "react";
import { SkipLinks } from "./components/skipLinks/SkipLinks";
import { RouteLoading } from "./components/loading/RouteLoading";
import { PWAUpdateBanner } from "./components/pwa/PWAUpdateBanner";
import { PWAInstallBanner } from "./components/pwa/PWAInstallBanner";
import { PageErrorBoundary } from "./components/error/PageErrorBoundary";
import { Toast } from "./components/toast/Toast";

function AppContent() {
    const isMobile = useCheckedMobile();
    const location = useLocation();
    usePageTracking();
    const scrollPositionsRef = useRef<Record<string, number>>({});
    const isBlogDetailPage = location.pathname.startsWith("/blog/") && location.pathname !== "/blog/";
    const { isTerminalVisible } = useContext(TerminalContext);

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

        const handleScroll = () => {
            scrollPositionsRef.current[location.pathname] = container.scrollTop;
            try {
                localStorage.setItem(
                    "portfolio-scroll-positions",
                    JSON.stringify(scrollPositionsRef.current),
                );
            } catch {
                // ignore storage errors
            }
        };

        const restore = () => {
            const saved = scrollPositionsRef.current[location.pathname] ?? 0;
            container.scrollTop = saved;
        };

        requestAnimationFrame(restore);
        container.addEventListener("scroll", handleScroll, { passive: true });

        return () => {
            container.removeEventListener("scroll", handleScroll);
        };
    }, [location.pathname]);

    return (
        <section className="w-full min-h-dvh flex flex-col relative overflow-x-hidden overflow-y-auto">
            <SkipLinks />
            <AppChildContainer />

            <Suspense fallback={<RouteLoading />}>
                <Routes>
                    {routesPath.map((r) => (
                        <Route
                            key={r.path}
                            path={r.path}
                            element={
                                <PageErrorBoundary pageName={r.name}>
                                    <r.component />
                                </PageErrorBoundary>
                            }
                        />
                    ))}
                </Routes>
            </Suspense>

            {!isMobile && !isBlogDetailPage && isTerminalVisible && <Bottom />}
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
                <AppContent />
            </KeyboardProvider>
        </GlobalStateProvider>
    );
}

export default App;
