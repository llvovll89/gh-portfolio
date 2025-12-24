import { Contents } from "../../components/contents/Contents";
import { Header } from "../../components/header/Header";
import { DefaultPageHeader } from "./contents/header/DefaultPageHeader";
import { Aside } from "../../components/aside/Aside";
import { Bottom } from "../../components/footer/Footer";
import { MainContents } from "./contents/main/MainContents";
import { Footer } from "./contents/footer/Footer";

export const Default = () => {
    return (
        <>
            <Header />
            <Aside />
            <Contents className="select-none">
                <section className="w-full h-full text-white p-3 flex flex-col items-center">
                    <DefaultPageHeader />
                    <MainContents />
                    {/* <Footer /> */}
                </section>
            </Contents>
            <Bottom />
        </>
    );
};
