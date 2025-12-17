import {Route, Routes} from "react-router-dom";
import {routesPath} from "../../routes/route";
import {useKeyboardEvent} from "../../hooks/useKeyboardEvent";

export const Default = () => {
    useKeyboardEvent();

    return (
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
    );
};
