import { uiText } from "../../utils/uiText";
import { Aside } from "../../components/aside/Aside";
import { Contents } from "../../components/contents/Contents";
import { Header } from "../../components/header/Header";
import { PageHeader } from "../../components/pageHeader/PageHeader";
import { ProjectContentsCards } from "./common/ProjectContentsCards";
import { useTranslation } from "react-i18next";
import { useSeoMeta } from "../../hooks/useSeoMeta";

export const Projects = () => {
    const { t } = useTranslation();
    useSeoMeta({
        title: t("pages.projects.title"),
        description: uiText("React, TypeScript, Firebase를 활용한 김건호의 웹 프로젝트 모음"),
        url: "/projects",
    });

    return (
        <>
            <Header />
            <Aside />
            <Contents className="gap-4">
                <section className="relative mx-auto w-full max-w-7xl px-2 pb-8 md:px-6">
                    <PageHeader title={t("pages.projects.title")} description={t("pages.projects.subtitle")} />
                    <ProjectContentsCards />
                </section>
            </Contents>
        </>
    );
};
