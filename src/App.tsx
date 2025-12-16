import {Route, Routes} from "react-router-dom";
import {routesPath} from "./routes/route";
import {GlobalStateProvider} from "./context/GlobalState.context";

function App() {
    return (
        <GlobalStateProvider>
            <section className="w-screen min-h-screen flex flex-col relative bg-main">
                <Routes>
                    {routesPath.map((r) => (
                        <Route
                            key={r.path}
                            path={r.path}
                            element={<r.component />}
                        />
                    ))}
                </Routes>
            </section>
        </GlobalStateProvider>
    );
}

export default App;
