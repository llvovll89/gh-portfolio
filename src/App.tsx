import { Route, Routes } from "react-router-dom";
import { routesPath } from "./routes/route";

function App() {
    return (
        <section className="min-h-screen w-screen relative flex flex-col">
            <Routes>
                {routesPath.map((r) => (
                    <Route key={r.path} path={r.path} element={<r.component />} />
                ))}
            </Routes>
        </section>
    );
}

export default App;
