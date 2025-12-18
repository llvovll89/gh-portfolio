import {Aside} from "../../components/aside/Aside";
import {Contents} from "../../components/contents/Contents";
import {Bottom} from "../../components/footer/Footer";
import {Header} from "../../components/header/Header";

export const Projects = () => {
    return (
        <>
            <Header />
            <Aside />
            <Contents className="select-none">
                <section className="w-full h-full bg-white py-4 px-5 flex flex-col items-center">
                    <header className=""></header>
                    <article className="flex flex-col w-full">
                        <h1 className="text-2xl font-bold w-full flex justify-start">
                            Projects
                        </h1>
                    </article>
                </section>
            </Contents>
            <Bottom />
        </>
    );
};
