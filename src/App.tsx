import { useRouteFocus } from "./hooks/useRouteFocus";
import { useTranslation } from "react-i18next";
import {Route, Routes, useLocation} from "react-router-dom";
import {Suspense, useLayoutEffect} from "react";
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
import {useMatchedRoute} from "./hooks/useMatchedRoute";

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
    usePageTracking();
    useRouteFocus();
    const isBlogDetailPage =
        location.pathname.startsWith("/blog/") &&
        location.pathname !== "/blog/";
    const {isTerminalVisible} = useContext(TerminalContext);
    const matchedRoute = useMatchedRoute();


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
                                // 라우트가 같은 자리에 렌더되어 boundary 인스턴스가 재사용되므로, 경로가 바뀌면 에러 상태를 초기화
                                <PageErrorBoundary key={location.pathname} pageName={r.name}>
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
            {!isMobile && <StatusBar fullWidth={!matchedRoute} />}
            <PWAInstallBanner />
            <PWAUpdateBanner />
            <Toast />
        </section>
    );
}

export function App() {
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

