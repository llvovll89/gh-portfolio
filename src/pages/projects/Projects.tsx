import {Aside} from "../../components/aside/Aside";
import {Contents} from "../../components/contents/Contents";
import {Bottom} from "../../components/footer/Footer";
import {Header} from "../../components/header/Header";
import {CommonPageHeader} from "../common/innerHeader/CommonPageHeader";
import {ProjectContentsCards} from "./common/ProjectContentsCards";

export const Projects = () => {
    return (
        <>
            <Header />
            <Aside />
            <Contents className="select-none gap-4">
                <CommonPageHeader />
                <section className="w-full flex flex-col gap-2 h-full gap-1 relative">
                    <ProjectContentsCards />
                </section>
            </Contents>
            <Bottom />
        </>
    );
};
