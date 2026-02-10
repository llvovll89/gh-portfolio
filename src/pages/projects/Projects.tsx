import { Aside } from "../../components/aside/Aside";
import { Contents } from "../../components/contents/Contents";
import { Header } from "../../components/header/Header";
import { CommonPageHeader } from "../common/innerHeader/CommonPageHeader";
import { ProjectContentsCards } from "./common/ProjectContentsCards";

export const Projects = () => {
    return (
        <>
            <Header />
            <Aside />
            <Contents className="select-none gap-4">
                <CommonPageHeader />
                <section className="w-full flex flex-col gap-2 h-full relative md:px-0 px-2">
                    <ProjectContentsCards />
                </section>
            </Contents>
        </>
    );
};
