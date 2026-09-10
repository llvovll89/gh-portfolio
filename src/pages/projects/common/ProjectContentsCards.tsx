import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { LuArrowUpRight, LuFolderOpen } from "react-icons/lu";
import type { Project } from "../mocks/projectData";
import { projects } from "../mocks/projectData";
import { CardDetail } from "./CardDetail";

type SortKey = "default" | "name";

interface CardProps { className?: string }

const ProjectCard = ({ project, onOpen, featured = false }: { project: Project; onOpen: () => void; featured?: boolean }) => {
    const { t } = useTranslation();

    return (
        <button
        type="button"
        onClick={onOpen}
        className={`project-card group grid w-full overflow-hidden rounded-2xl border border-white/10 bg-[#18181b] text-left transition-colors hover:border-primary/45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${featured ? "md:grid-cols-[0.9fr_1.1fr]" : ""}`}
    >
        <div className={`relative overflow-hidden bg-[#202024] ${featured ? "min-h-52 md:min-h-64" : "h-44"}`}>
            <img src={project.image} alt="" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" />

        </div>
        <div className="flex min-w-0 flex-col p-5 sm:p-6">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white/42">{project.scale}</p>
                    <h2 className="mt-1 text-xl font-bold tracking-tight text-white sm:text-2xl">{project.title}</h2>
                </div>
                <LuArrowUpRight className="h-5 w-5 shrink-0 text-white/38 transition-colors group-hover:text-primary" aria-hidden="true" />
            </div>
            <p className="mt-4 line-clamp-3 text-sm leading-6 text-white/62">{project.description}</p>
            {project.role && <p className="mt-5 border-l-2 border-primary/55 pl-3 text-xs leading-5 text-white/72"><span className="text-white/38">{t("pages.projects.role")} </span>{project.role}</p>}
            <div className="mt-auto flex flex-wrap gap-1.5 pt-5">
                {project.skills.slice(0, featured ? 5 : 4).map((skill) => (
                    <span key={skill} className="rounded-md border border-white/9 bg-white/4 px-2 py-1 text-[10px] font-medium text-white/55">{skill}</span>
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
    const [sortKey, setSortKey] = useState<SortKey>("default");

    const allSkills = useMemo(() => [...new Set(projects.flatMap((project) => project.skills))].sort(), []);
    const filteredProjects = useMemo(() => {
        const base = selectedSkill ? projects.filter((project) => project.skills.includes(selectedSkill)) : projects;
        return sortKey === "name" ? [...base].sort((a, b) => a.title.localeCompare(b.title, "ko")) : base;
    }, [selectedSkill, sortKey]);
    const selected = projects.find((project) => project.id === selectedProjectId) ?? null;
    const featuredProjects = filteredProjects.filter((project) => project.featured);
    const archiveProjects = filteredProjects.filter((project) => !project.featured);

    return (
        <>
            <div className="mb-7 flex flex-col gap-3 border-b border-white/10 pb-5 sm:flex-row sm:items-end sm:justify-between">
                <div className="min-w-0">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-white/38">{t("pages.projects.filterByTech")}</p>
                    <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 scrolls">
                        <button type="button" onClick={() => setSelectedSkill(null)} className={`shrink-0 rounded-lg border px-3 py-2 text-xs font-semibold ${selectedSkill === null ? "border-primary bg-primary text-slate-950" : "border-white/10 bg-white/4 text-white/58 hover:text-white"}`}>{t("pages.projects.filterAll")}</button>
                        {allSkills.map((skill) => <button type="button" key={skill} onClick={() => setSelectedSkill(skill)} className={`shrink-0 rounded-lg border px-3 py-2 text-xs font-semibold ${selectedSkill === skill ? "border-primary bg-primary text-slate-950" : "border-white/10 bg-white/4 text-white/58 hover:text-white"}`}>{skill}</button>)}
                    </div>
                </div>
                <select aria-label={t("pages.projects.sortLabel")} value={sortKey} onChange={(event) => setSortKey(event.target.value as SortKey)} className="min-h-10 rounded-lg border border-white/10 bg-[#202024] px-3 text-xs text-white/64 outline-none focus:border-primary">
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
                    {featuredProjects.length > 0 && (
                        <section aria-labelledby="featured-projects">
                            <h2 id="featured-projects" className="mb-4 text-sm font-bold text-white/58">{t("pages.projects.featuredProjects")}</h2>
                            <div className="grid gap-4 lg:grid-cols-2">
                                {featuredProjects.map((project, index) => <div key={project.id} className={index === 0 ? "lg:col-span-2" : ""}><ProjectCard project={project} featured={index === 0} onOpen={() => setSelectedProjectId(project.id)} /></div>)}
                            </div>
                        </section>
                    )}
                    {archiveProjects.length > 0 && (
                        <section aria-labelledby="project-archive">
                            <h2 id="project-archive" className="mb-4 text-sm font-bold text-white/58">{t("pages.projects.archive")}</h2>
                            <div className="grid gap-6 md:grid-cols-2">
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
