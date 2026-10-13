import { OptimizedImage } from "../../components/OptimizedImage";
import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { LuArrowLeft, LuArrowUpRight, LuCheck, LuLink } from "react-icons/lu";
import { SiGithub } from "react-icons/si";
import { FeedbackPage } from "../../components/error/FeedbackPage";
import { Header } from "../../components/header/Header";
import { Aside } from "../../components/aside/Aside";
import { Contents } from "../../components/contents/Contents";
import { useSeoMeta } from "../../hooks/useSeoMeta";
import { CardDescAndSkills } from "./common/CardDescAndSkills";
import { projectPath, useProjects } from "./useProjects";

export const ProjectDetail = () => {
    const { slug } = useParams();
    const { t } = useTranslation();
    const project = useProjects().find(item => item.slug === slug);
    const [copyState, setCopyState] = useState<"idle" | "copied" | "error">("idle");
    useSeoMeta({
        title: project?.title ?? t("pages.projects.notFound"),
        description: project?.description,
        image: project?.image,
        url: project ? projectPath(project) : undefined,
        noIndex: !project,
    });

    const copyLink = async () => {
        if (!project) return;
        try {
            await navigator.clipboard.writeText(new URL(projectPath(project), window.location.origin).href);
            setCopyState("copied");
        } catch {
            setCopyState("error");
        }
    };

    if (!project) return <FeedbackPage kind="notFound" backTo="/projects" />;

    return <>
        <Header />
        <Aside />
        <Contents>
            <article className="project-detail-page mx-auto w-full max-w-4xl pb-10">
                <Link to="/projects" className="workbench-button mb-6"><LuArrowLeft aria-hidden="true" />{t("pages.projects.backToProjects")}</Link>
                {project ? <>
                    <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
                        <div><p className="mb-2 text-sm text-muted">{project.scale}</p><h1 className="text-3xl font-bold text-foreground">{project.title}</h1><p className="mt-3 max-w-2xl text-sm leading-7 text-muted">{project.description}</p></div>
                        <button type="button" className="workbench-button" onClick={copyLink}>{copyState === "copied" ? <LuCheck aria-hidden="true" /> : <LuLink aria-hidden="true" />}{t("pages.projects.copyLink")}</button>
                    </header>
                    <p className="mb-3 text-sm text-muted" role="status">{copyState !== "idle" ? t(`pages.projects.${copyState === "copied" ? "linkCopied" : "copyError"}`) : ""}</p>
                    <div className="mb-6 flex flex-wrap gap-3">
                        <a href={project.link.repositoryUrl} className="workbench-button" target="_blank" rel="noreferrer"><SiGithub aria-hidden="true" />{t("pages.projects.viewRepository")}</a>
                        {project.link.projectUrl && <a href={project.link.projectUrl} className="workbench-button workbench-button-primary" target="_blank" rel="noreferrer">{t("pages.projects.viewProject")}<LuArrowUpRight aria-hidden="true" /></a>}
                    </div>
                    <div className={`project-dialog-image${project.previewLayout === "mobile" ? " project-dialog-image-mobile" : ""}`}>
                        <OptimizedImage src={project.previewImage ?? project.image} alt={t("pages.projects.screenshot", { title: project.title })} sizes={project.previewLayout === "mobile" ? "320px" : "(max-width: 639px) calc(100vw - 32px), 896px"} fetchPriority="high" />
                    </div>
                    <div className="project-dialog-body"><CardDescAndSkills project={project} headingLevel={2} /></div>

                </> : <h1 className="text-2xl font-bold">{t("pages.projects.notFound")}</h1>}
            </article>
        </Contents>
    </>;
};
