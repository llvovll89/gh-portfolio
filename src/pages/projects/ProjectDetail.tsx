import { OptimizedImage } from "../../components/OptimizedImage";
import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { LuArrowLeft, LuArrowUpRight, LuCheck, LuChevronLeft, LuChevronRight, LuLink } from "react-icons/lu";
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
    const projects = useProjects();
    // 목록과 같은 순서(대표 → 다른 → 보관)로 이전/다음을 연결
    const ordered = [
        ...projects.filter(item => item.featured).sort((a, b) => (a.featuredOrder ?? 99) - (b.featuredOrder ?? 99)),
        ...projects.filter(item => !item.featured && !item.archived),
        ...projects.filter(item => item.archived && !item.featured),
    ];
    const projectIndex = ordered.findIndex(item => item.slug === slug);
    const project = ordered[projectIndex];
    const prevProject = projectIndex > 0 ? ordered[projectIndex - 1] : undefined;
    const nextProject = projectIndex >= 0 && projectIndex < ordered.length - 1 ? ordered[projectIndex + 1] : undefined;
    const gallery = project
        // 모바일 미리보기 프로젝트의 데스크톱 원본은 여백이 큰 캡처라 제외
        ? [...new Set([project.previewImage ?? project.image, ...(project.previewLayout === "mobile" ? [] : [project.image])])].map(src => ({ src, mobile: project.previewLayout === "mobile" && src === project.previewImage }))
        : [];
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
                        <button type="button" className="workbench-button" onClick={() => { void copyLink(); }}>{copyState === "copied" ? <LuCheck aria-hidden="true" /> : <LuLink aria-hidden="true" />}{t("pages.projects.copyLink")}</button>
                    </header>
                    <p className="mb-3 text-sm text-muted" role="status">{copyState !== "idle" ? t(`pages.projects.${copyState === "copied" ? "linkCopied" : "copyError"}`) : ""}</p>
                    <div className="mb-6 flex flex-wrap gap-3">
                        <a href={project.link.repositoryUrl} className="workbench-button" target="_blank" rel="noreferrer"><SiGithub aria-hidden="true" />{t("pages.projects.viewRepository")}</a>
                        {project.link.projectUrl && <a href={project.link.projectUrl} className="workbench-button workbench-button-primary" target="_blank" rel="noreferrer">{t("pages.projects.viewProject")}<LuArrowUpRight aria-hidden="true" /></a>}
                    </div>
                    {/* 목록 카드와 이어지는 스크린샷을 먼저, 데스크톱 전체 화면이 따로 있으면 함께 보여줌 */}
                    <div className="project-gallery">
                        {gallery.map((shot, index) => (
                            <div key={shot.src} className={`project-gallery-item${shot.mobile ? " project-gallery-item-mobile" : " project-gallery-wide"}`}>
                                <OptimizedImage
                                    style={index === 0 ? { viewTransitionName: `project-shot-${project.slug}` } : undefined}
                                    src={shot.src}
                                    alt={gallery.length > 1 ? t("pages.projects.gallery", { title: project.title, index: index + 1 }) : t("pages.projects.screenshot", { title: project.title })}
                                    sizes={shot.mobile ? "320px" : "(max-width: 639px) calc(100vw - 32px), 896px"}
                                    fetchPriority={index === 0 ? "high" : undefined}
                                    loading={index === 0 ? "eager" : "lazy"}
                                />
                            </div>
                        ))}
                    </div>
                    <div className="project-dialog-body"><CardDescAndSkills project={project} headingLevel={2} /></div>
                    <nav className="project-pager" aria-label={t("pages.projects.backToProjects")}>
                        {prevProject ? <Link to={projectPath(prevProject)} viewTransition><span><LuChevronLeft aria-hidden="true" />{t("pages.projects.prevProject")}</span><strong>{prevProject.title}</strong></Link> : <span />}
                        {nextProject && <Link to={projectPath(nextProject)} className="is-next" viewTransition><span>{t("pages.projects.nextProject")}<LuChevronRight aria-hidden="true" /></span><strong>{nextProject.title}</strong></Link>}
                    </nav>

                </> : <h1 className="text-2xl font-bold">{t("pages.projects.notFound")}</h1>}
            </article>
        </Contents>
    </>;
};
