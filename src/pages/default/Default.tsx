import {Route, Routes} from "react-router-dom";
import {routesPath} from "../../routes/route";
import {useKeyboardEvent} from "../../hooks/useKeyboardEvent";
import { useContext } from "react";
import { GlobalStateContext } from "../../context/GlobalState.context";
import { Contents } from "../../components/contents/Contents";

export const Default = () => {
    useKeyboardEvent();

    const {selectedPathState} = useContext(GlobalStateContext);

    return (
        <section className="w-screen min-h-screen flex flex-col relative bg-main">
            {selectedPathState.list.length === 0 && (
                <Contents className="select-none">
                    <section className="w-full h-full bg-white py-4 px-5 flex flex-col items-center">
                        <header className=""></header>
                        <article className="flex flex-col w-full">
                            <h1 className="text-2xl font-bold w-full flex justify-start">
                                아무것도 선택되지 않은 상태입니다.
                            </h1>
                        </article>
                    </section>
                </Contents>
            )}

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
