import {Contents} from "../../components/contents/Contents";
import {Header} from "../../components/header/Header";
import {Aside} from "../../components/aside/Aside";
import {Bottom} from "../../components/footer/Footer";

export const Default = () => {
    return (
        <>
            <Header />
            <Aside />
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
            <Bottom />
        </>
    );
};
