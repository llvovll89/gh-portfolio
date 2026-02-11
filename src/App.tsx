import {Route, Routes, useLocation} from "react-router-dom";
import {GlobalStateProvider, GlobalStateContext} from "./context/GlobalState.context";
import {KeyboardProvider} from "./context/KeyboardState.context";
import {routesPath} from "./routes/route";
import {AppChildContainer} from "./components/appChildContainer/AppChildContainer";
import {Bottom} from "./components/footer/Footer";
import {useCheckedMobile} from "./hooks/useCheckedMobile";
import {useContext} from "react";

function AppContent() {
    const isMobile = useCheckedMobile();
    const location = useLocation();
    const isBlogDetailPage = location.pathname.startsWith("/blog/") && location.pathname !== "/blog/";
    const {isTerminalVisible} = useContext(GlobalStateContext);

    return (
        <section className="w-full min-h-dvh flex flex-col relative overflow-x-hidden overflow-y-auto">
            <AppChildContainer />

            <Routes>
                {routesPath.map((r) => (
                    <Route
                        key={r.path}
                        path={r.path}
                        element={<r.component />}
                    />
                ))}
            </Routes>

            {!isMobile && !isBlogDetailPage && isTerminalVisible && <Bottom />}
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
