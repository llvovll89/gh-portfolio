import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { LuArrowUpRight, LuFolderOpen } from "react-icons/lu";
import type { Project } from "../mocks/projectData";
import { projects, featuredProjects } from "../mocks/projectData";
import { CardDetail } from "./CardDetail";
import { ProjectPreview } from "./ProjectPreview";

type SortKey = "default" | "name";

interface CardProps { className?: string }

const ProjectCard = ({ project, onOpen, featured = false }: { project: Project; onOpen: () => void; featured?: boolean }) => {
    const { t } = useTranslation();

    return (
        <button
        type="button"
        onClick={onOpen}
        className={`project-card group grid h-full min-w-0 w-full overflow-hidden rounded-2xl border border-white/10 bg-[#18181b] text-left transition-colors hover:border-primary/45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${featured ? "project-card-featured md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]" : ""}`}
    >
        <div className={`relative overflow-hidden bg-[#202024] ${featured ? "aspect-video md:aspect-auto md:min-h-72" : "aspect-video"}`}>
            <ProjectPreview project={project} eager={featured} />

        </div>
        <div className="project-card-body flex min-w-0 flex-col p-4 sm:p-5">
            <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-[#a4aab3]">{project.scale}</p>
                    <h2 className="mt-1 break-words text-lg font-bold tracking-tight text-white sm:text-xl">{project.title}</h2>
                </div>
                <LuArrowUpRight className="h-5 w-5 shrink-0 text-white/38 transition-colors group-hover:text-primary" aria-hidden="true" />
            </div>
            <p className="mt-3 min-h-18 line-clamp-3 text-sm leading-6 text-white/62">{project.description}</p>
            <div className="mt-3 min-h-10">{project.role && <p className="line-clamp-2 border-l-2 border-primary/55 pl-3 text-[13px] leading-5 text-white/80"><span className="text-[#a4aab3]">{t("pages.projects.role")} </span>{project.role}</p>}</div>
            <div className="mt-auto flex flex-wrap gap-1.5 pt-3">
                {project.skills.slice(0, featured ? 5 : 4).map((skill) => (
                    <span key={skill} className="rounded-md border border-white/9 bg-white/4 px-2 py-1 text-xs font-medium text-[#a4aab3]">{skill}</span>
                ))}
            </div>
        </div>
        </button>
    );
};

export const ProjectContentsCards = ({ className }: CardProps) => {
    const { t } = useTranslation();
    const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
    const [selectedSkill, setSelectedSkill] = useState<string | null>(null);
    const [showAllSkills, setShowAllSkills] = useState(false);
    const [sortKey, setSortKey] = useState<SortKey>("default");

    const allSkills = useMemo(() => [...new Set(projects.flatMap((project) => project.skills))].sort(), []);
    const primarySkills = ["React", "TypeScript", "Next.js", "PWA"];
    const visibleSkills = showAllSkills ? allSkills : [...new Set([...primarySkills, ...(selectedSkill ? [selectedSkill] : [])])];
    const filteredProjects = useMemo(() => {
        const base = selectedSkill ? projects.filter((project) => project.skills.includes(selectedSkill)) : projects;
        return sortKey === "name" ? [...base].sort((a, b) => a.title.localeCompare(b.title, "ko")) : base;
    }, [selectedSkill, sortKey]);
    const selected = projects.find((project) => project.id === selectedProjectId) ?? null;
    const featuredProject = sortKey === "default" ? featuredProjects.find(project => filteredProjects.includes(project)) : undefined;
    const archiveProjects = filteredProjects.filter(project => project.id !== featuredProject?.id);

    return (
        <>
            <div className="mb-7 flex flex-col gap-3 border-b border-white/10 pb-5 sm:flex-row sm:items-end sm:justify-between">
                <div className="min-w-0">
                    <p className="mb-2 text-[13px] font-medium text-[#a4aab3]">{t("pages.projects.filterByTech")}</p>
                    <div className="flex flex-wrap gap-2" role="group" aria-label={t("pages.projects.filterByTech")}>
                        <button type="button" aria-pressed={selectedSkill === null} onClick={() => setSelectedSkill(null)} className={`min-h-10 rounded-md border px-3 py-2 text-xs font-semibold ${selectedSkill === null ? "border-primary bg-primary text-slate-950" : "border-white/10 bg-white/4 text-[#a4aab3] hover:text-white"}`}>{t("pages.projects.filterAll")}</button>
                        {visibleSkills.map((skill) => <button type="button" key={skill} aria-pressed={selectedSkill === skill} onClick={() => setSelectedSkill(skill)} className={`min-h-10 rounded-md border px-3 py-2 text-xs font-semibold ${selectedSkill === skill ? "border-primary bg-primary text-slate-950" : "border-white/10 bg-white/4 text-[#a4aab3] hover:text-white"}`}>{skill}</button>)}
                        <button type="button" aria-expanded={showAllSkills} onClick={() => setShowAllSkills(value => !value)} className="min-h-10 rounded-md border border-white/15 px-3 py-2 text-xs text-primary">{t(showAllSkills ? "pages.projects.fewerFilters" : "pages.projects.moreFilters")}</button>
                    </div>
                </div>
                <select aria-label={t("pages.projects.sortLabel")} value={sortKey} onChange={(event) => setSortKey(event.target.value as SortKey)} className="min-h-10 shrink-0 self-start sm:self-auto rounded-lg border border-white/10 bg-[#202024] px-3 text-xs text-white/64 outline-none focus:border-primary">
                    <option value="default">{t("pages.projects.sortDefault")}</option>
                    <option value="name">{t("pages.projects.sortName")}</option>
                </select>
            </div>

            {filteredProjects.length === 0 ? (
                <div className="grid min-h-64 place-items-center rounded-2xl border border-dashed border-white/12 text-center">
                    <div><LuFolderOpen className="mx-auto h-8 w-8 text-white/30" /><p className="mt-3 text-sm text-white/60">{t("pages.projects.noProjects")}</p></div>
                </div>
            ) : (
                <div className={`space-y-10 ${className ?? ""}`}>
                    {featuredProject && (
                        <section aria-labelledby="featured-projects">
                            <h2 id="featured-projects" className="mb-4 text-sm font-bold text-white/58">{t("pages.projects.featuredProjects")}</h2>
                            <ProjectCard project={featuredProject} featured onOpen={() => setSelectedProjectId(featuredProject.id)} />
                        </section>
                    )}
                    {archiveProjects.length > 0 && (
                        <section aria-labelledby="project-archive">
                            <h2 id="project-archive" className="mb-4 text-sm font-bold text-white/58">{t("pages.projects.archive")}</h2>
                            <div className="project-archive-grid grid auto-rows-fr gap-4 md:grid-cols-2 xl:grid-cols-3">
                                {archiveProjects.map((project) => <ProjectCard key={project.id} project={project} onOpen={() => setSelectedProjectId(project.id)} />)}
                            </div>
                        </section>
                    )}
                </div>
            )}
            {selected && <CardDetail selected={selected} setSelectedProject={() => setSelectedProjectId(null)} />}
        </>
    );
};
