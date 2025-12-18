import {useContext} from "react";
import {Aside} from "../../components/aside/Aside";
import {Contents} from "../../components/contents/Contents";
import {Bottom} from "../../components/footer/Footer";
import {Header} from "../../components/header/Header";
import {GlobalStateContext} from "../../context/GlobalState.context";

export const Main = () => {
    const {selectedPathState} = useContext(GlobalStateContext);

    return (
        <>
            <Header />
            <Aside />
            {selectedPathState.list.length > 0 && (
                <Contents className="select-none">
                    <section className="w-full h-full bg-white py-4 px-5 flex flex-col items-center">
                        <header className=""></header>
                        <article className="flex flex-col w-full">
                            <h1 className="text-2xl font-bold w-full flex justify-start">
                                Web Developer "김건호"
                            </h1>
                        </article>
                    </section>
                </Contents>
            )}
            <Bottom />
        </>
    );
};
