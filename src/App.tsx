import { Route, Routes, useLocation } from "react-router-dom";
import { Suspense } from "react";
import { GlobalStateProvider } from "./context/GlobalState.context";
import { TerminalContext } from "./context/TerminalContext";
import { KeyboardProvider } from "./context/KeyboardState.context";
import { routesPath } from "./routes/route";
import { AppChildContainer } from "./components/appChildContainer/AppChildContainer";
import { Bottom } from "./components/footer/Footer";
import { useCheckedMobile } from "./hooks/useCheckedMobile";
import { useContext } from "react";
import { SkipLinks } from "./components/skipLinks/SkipLinks";
import { RouteLoading } from "./components/loading/RouteLoading";
import { PWAUpdateBanner } from "./components/pwa/PWAUpdateBanner";
import { PWAInstallBanner } from "./components/pwa/PWAInstallBanner";
import { PageErrorBoundary } from "./components/error/PageErrorBoundary";

function AppContent() {
    const isMobile = useCheckedMobile();
    const location = useLocation();
    const isBlogDetailPage = location.pathname.startsWith("/blog/") && location.pathname !== "/blog/";
    const { isTerminalVisible } = useContext(TerminalContext);

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
