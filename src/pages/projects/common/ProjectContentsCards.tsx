import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { LuArrowUpRight, LuFolderOpen } from "react-icons/lu";
import type { Project } from "../projectData";
import { Link } from "react-router-dom";
import { projectPath, useProjects } from "../useProjects";
import { ProjectPreview } from "./ProjectPreview";

type SortKey = "default" | "name";

interface CardProps { className?: string }

const ProjectCard = ({ project, featured = false }: { project: Project; featured?: boolean }) => {
    const { t } = useTranslation();

    return (
        <Link
        to={projectPath(project)}
        viewTransition
        className={`project-card group grid h-full min-w-0 w-full overflow-hidden rounded-2xl border border-foreground/10 bg-panel text-left transition-colors hover:border-primary/45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${featured ? "project-card-featured md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]" : ""}`}
    >
        <div className={`relative overflow-hidden bg-inset ${featured ? "aspect-video md:aspect-auto md:min-h-72" : "aspect-video"}`}>
            <ProjectPreview project={project} eager={featured} />

        </div>
        <div className="project-card-body flex min-w-0 flex-col p-4 sm:p-5">
            <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-muted">{project.scale}</p>
                    <h2 className="mt-1 break-words text-lg font-bold tracking-tight text-foreground sm:text-xl">{project.title}</h2>
                </div>
                <LuArrowUpRight className="h-5 w-5 shrink-0 text-muted transition-colors group-hover:text-primary" aria-hidden="true" />
            </div>
            <p className="mt-3 min-h-18 line-clamp-3 text-sm leading-6 text-muted">{project.description}</p>
            {/* 큰 카드는 남는 공간에 결과 문장을 보여 줌 */}
            {featured && project.outcome && <p className="mt-2 text-[15px] leading-7 text-foreground">{project.outcome}</p>}
            <div className="mt-3 min-h-11">{project.role && <p className="line-clamp-2 border-l-2 border-primary/55 pl-3 text-[13px] leading-5 text-foreground"><span className="text-muted">{t("pages.projects.role")} </span>{project.role}</p>}</div>
            <div className="mt-auto flex flex-wrap gap-1.5 pt-3">
                {project.skills.slice(0, featured ? 5 : 4).map((skill) => (
                    <span key={skill} className="rounded-md border border-foreground/9 bg-foreground/4 px-2 py-1 text-xs font-medium text-muted">{skill}</span>
                ))}
            </div>
        </div>
        </Link>
    );
};

export const ProjectContentsCards = ({ className }: CardProps) => {
    const { t } = useTranslation();
    const projects = useProjects();
    const featuredProjects = useMemo(() => projects.filter(project => project.featured).sort((a, b) => (a.featuredOrder ?? 99) - (b.featuredOrder ?? 99)), [projects]);
    const [selectedSkill, setSelectedSkill] = useState<string | null>(null);
    const [showAllSkills, setShowAllSkills] = useState(false);
    const [sortKey, setSortKey] = useState<SortKey>("default");

    const allSkills = useMemo(() => [...new Set(projects.flatMap((project) => project.skills))].sort(), [projects]);
    const primarySkills = ["React", "TypeScript", "Next.js", "PWA"];
    const visibleSkills = showAllSkills ? allSkills : [...new Set([...primarySkills, ...(selectedSkill ? [selectedSkill] : [])])];
    const filteredProjects = useMemo(() => {
        const base = selectedSkill ? projects.filter((project) => project.skills.includes(selectedSkill)) : projects;
        return sortKey === "name" ? [...base].sort((a, b) => a.title.localeCompare(b.title, "ko")) : base;
    }, [projects, selectedSkill, sortKey]);
    // 대표(featured) → 다른 프로젝트 → 보관(archived) 3단으로 나눠, 비중이 다른 작업이 같은 모양으로 섞이지 않게 함
    const tierFeatured = sortKey === "default" ? featuredProjects.filter(project => filteredProjects.includes(project)) : filteredProjects.filter(project => project.featured);
    const tierOther = filteredProjects.filter(project => !project.featured && !project.archived);
    const tierArchived = filteredProjects.filter(project => project.archived && !project.featured);

    return (
        <>
            <div className="mb-7 flex flex-col gap-3 border-b border-foreground/10 pb-5 sm:flex-row sm:items-end sm:justify-between">
                <div className="min-w-0">
                    <p className="mb-2 text-[13px] font-medium text-muted">{t("pages.projects.filterByTech")}</p>
                    <div className="flex gap-2 overflow-x-auto pb-1 scrolls sm:flex-wrap sm:overflow-visible sm:pb-0 [&>button]:shrink-0" role="group" aria-label={t("pages.projects.filterByTech")}>
                        <button type="button" aria-pressed={selectedSkill === null} onClick={() => setSelectedSkill(null)} className={`min-h-11 rounded-md border px-3 py-2 text-xs font-semibold ${selectedSkill === null ? "border-primary bg-primary text-on-accent" : "border-foreground/10 bg-foreground/4 text-muted hover:text-foreground"}`}>{t("pages.projects.filterAll")}</button>
                        {visibleSkills.map((skill) => <button type="button" key={skill} aria-pressed={selectedSkill === skill} onClick={() => setSelectedSkill(skill)} className={`min-h-11 rounded-md border px-3 py-2 text-xs font-semibold ${selectedSkill === skill ? "border-primary bg-primary text-on-accent" : "border-foreground/10 bg-foreground/4 text-muted hover:text-foreground"}`}>{skill}</button>)}
                        <button type="button" aria-expanded={showAllSkills} onClick={() => setShowAllSkills(value => !value)} className="min-h-11 rounded-md border border-foreground/15 px-3 py-2 text-xs text-primary">{t(showAllSkills ? "pages.projects.fewerFilters" : "pages.projects.moreFilters")}</button>
                    </div>
                </div>
                <select aria-label={t("pages.projects.sortLabel")} value={sortKey} onChange={(event) => setSortKey(event.target.value as SortKey)} className="min-h-11 shrink-0 self-start sm:self-auto rounded-lg border border-foreground/10 bg-inset px-3 text-xs text-muted outline-none focus:border-primary">
                    <option value="default">{t("pages.projects.sortDefault")}</option>
                    <option value="name">{t("pages.projects.sortName")}</option>
                </select>
            </div>

            {filteredProjects.length === 0 ? (
                <div className="grid min-h-64 place-items-center rounded-2xl border border-dashed border-foreground/12 text-center">
                    <div><LuFolderOpen className="mx-auto h-8 w-8 text-muted" /><p className="mt-3 text-sm text-muted">{t("pages.projects.noProjects")}</p></div>
                </div>
            ) : (
                <div className={className}>
                    {tierFeatured.length > 0 && (
                        <section className="project-tier" aria-labelledby="featured-projects">
                            <h2 id="featured-projects">{t("pages.projects.featuredProjects")}</h2>
                            <div className="project-featured-grid">
                                {tierFeatured.map((project, index) => <ProjectCard key={project.id} project={project} featured={index === 0} />)}
                            </div>
                        </section>
                    )}
                    {tierOther.length > 0 && (
                        <section className="project-tier" aria-labelledby="other-projects">
                            <h2 id="other-projects">{t("pages.projects.otherProjects")}</h2>
                            <div className="project-archive-grid grid gap-5 md:grid-cols-2">
                                {tierOther.map((project) => <ProjectCard key={project.id} project={project} />)}
                            </div>
                        </section>
                    )}
                    {tierArchived.length > 0 && (
                        <section className="project-tier" aria-labelledby="project-archive">
                            <h2 id="project-archive">{t("pages.projects.archive")}</h2>
                            <ul className="project-archive-list">
                                {tierArchived.map((project) => (
                                    <li key={project.id}>
                                        <Link to={projectPath(project)} className="project-archive-row">
                                            <strong>{project.title}</strong>
                                            <span>{project.description}</span>
                                            <LuArrowUpRight aria-hidden="true" />
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </section>
                    )}
                </div>
            )}
        </>
    );
};
