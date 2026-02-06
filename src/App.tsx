import {Route, Routes, useLocation} from "react-router-dom";
import {GlobalStateProvider} from "./context/GlobalState.context";
import {KeyboardProvider} from "./context/KeyboardState.context";
import {routesPath} from "./routes/route";
import {AppChildContainer} from "./components/appChildContainer/AppChildContainer";
import {Bottom} from "./components/footer/Footer";
import {useCheckedMobile} from "./hooks/useCheckedMobile";

function App() {
    const isMobile = useCheckedMobile();
    const location = useLocation();
    const isBlogDetailPage = location.pathname.startsWith("/blog/") && location.pathname !== "/blog/";

    return (
        <GlobalStateProvider>
            <KeyboardProvider>
                <section className="w-full min-h-screen flex flex-col relative overflow-hidden">
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

                    {!isMobile && !isBlogDetailPage && <Bottom />}
                </section>
            </KeyboardProvider>
        </GlobalStateProvider>
    );
}

export default App;
