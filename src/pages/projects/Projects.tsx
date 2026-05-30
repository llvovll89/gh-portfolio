import { Aside } from "../../components/aside/Aside";
import { Contents } from "../../components/contents/Contents";
import { Header } from "../../components/header/Header";
import { ProjectContentsCards } from "./common/ProjectContentsCards";
import { useTranslation } from "react-i18next";
import { FaFolder } from "react-icons/fa";
import { useSeoMeta } from "../../hooks/useSeoMeta";

export const Projects = () => {
    const { t } = useTranslation();
    useSeoMeta({
        title: "Projects",
        description: "김건호가 개발한 웹 프로젝트 모음 — React, TypeScript, Firebase 기반",
        url: "/projects",
    });

    return (
        <>
            <Header />
            <Aside />
            <Contents className="select-none gap-4">
                <section className="relative w-full max-w-8xl mx-auto overflow-auto scrolls px-2 md:px-6">
                    <div className="relative mb-6 sm:mb-10">
                        <div className="flex items-center gap-3 sm:mb-3 mb-1.5">
                            <div className="p-2 bg-primary/10 rounded-lg">
                                <FaFolder className="w-6 h-6 text-primary" />
                            </div>
                            <h1 className="text-[clamp(1.5rem,3vw,2.25rem)] font-extrabold tracking-tight">
                                {t("pages.projects.title")}
                            </h1>
                        </div>
                    </div>
                    <ProjectContentsCards />
                </section>
            </Contents>
        </>
    );
};
