import { useMemo, useState } from "react";
import { projects } from "../mocks/projectData";
import { CardDetail } from "./CardDetail";
import { useTranslation } from "react-i18next";

interface CardProps {
    className?: string;
}

export const ProjectContentsCards = ({ className }: CardProps) => {
    const { t } = useTranslation();
    const [selectedProject, setSelectedProject] = useState<number | null>(null);

    const selected = useMemo(
        () => (selectedProject === null ? null : projects[selectedProject]),
        [selectedProject],
    );

    return (
        <>
            {/* 카드 목록 */}
            <div
                className={`grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-7 auto-rows-fr ${className ?? ""}`}
            >
                {projects.map((project, index) => {
                    const isSelected = selectedProject === index;

                    return (
                        <button
                            type="button"
                            key={`${project.title}-${index}`}
                            onClick={() => setSelectedProject(index)}
                            className={[
                                "cursor-pointer group relative flex h-full flex-col overflow-hidden rounded-2xl border text-left",
                                "bg-[#F5F7F8] shadow-lg",
                                "transition-all duration-300 ease-out",
                                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-100",
                                isSelected
                                    ? "border-primary/70 shadow-[0_0_0_1px_rgba(59,130,246,0.35),0_18px_45px_rgba(15,23,42,0.14)]"
                                    : "border-slate-200/80 hover:-translate-y-2 hover:border-primary/50 hover:bg-white hover:shadow-[0_20px_50px_rgba(15,23,42,0.12)]",
                            ].join(" ")}
                        >
                            {/* 프로젝트 이미지 */}
                            <div className="relative aspect-video w-full overflow-hidden bg-slate-100">
                                <img
                                    src={project.image}
                                    alt={project.title}
                                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                                />

                                {/* 이미지 위 그라디언트 오버레이 */}
                                <div className="absolute inset-0 bg-linear-to-t from-black/40 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                                {/* 프로젝트 번호 배지 */}
                                <div className="absolute top-3 left-3">
                                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm text-xs font-bold text-slate-900 ring-1 ring-slate-200/50 shadow-lg">
                                        {index + 1}
                                    </span>
                                </div>

                                {/* 상세보기 배지 */}
                                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/95 backdrop-blur-sm border border-white/20 px-3 py-1.5 text-xs font-semibold text-slate-900 shadow-lg">
                                        <span>{t("pages.projects.viewDetails")}</span>
                                        <span className="text-[10px] translate-y-[0.5px]">→</span>
                                    </span>
                                </div>
                            </div>

                            {/* 그라디언트 하이라이트 */}
                            <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <div className="absolute inset-x-0 top-0 h-32 bg-linear-to-b from-primary/10 via-fuchsia-400/8 to-transparent blur-2xl" />
                            </div>

                            {/* 카드 콘텐츠 */}
                            <div className="relative flex flex-col gap-3 p-4 flex-1">
                                <div className="space-y-1.5">
                                    <div className="flex items-center gap-2">
                                        <p className="text-[10px] uppercase tracking-[0.15em] text-slate-400 font-medium">
                                            Project
                                        </p>
                                        <span className="h-1 w-1 rounded-full bg-slate-300" />
                                        <p className="text-[10px] text-slate-500 font-medium">
                                            {project.scale}
                                        </p>
                                    </div>

                                    <h2 className="text-lg md:text-xl font-bold tracking-tight text-slate-900 group-hover:text-primary transition-colors duration-200">
                                        {project.title}
                                    </h2>
                                </div>

                                <p className="text-sm leading-relaxed text-slate-600 line-clamp-2 flex-1">
                                    {project.description}
                                </p>

                                <div className="flex flex-wrap gap-1.5 mt-auto pt-2">
                                    {(project.skills ?? [])
                                        .slice(0, 4)
                                        .map((s: string) => (
                                            <span
                                                key={s}
                                                className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-slate-50/80 px-2 py-0.5 text-[10px] font-medium text-slate-700 backdrop-blur-sm transition-colors group-hover:border-primary/30 group-hover:bg-primary/5"
                                            >
                                                <span className="h-1 w-1 rounded-full bg-primary" />
                                                {s}
                                            </span>
                                        ))}
                                    {project.skills.length > 4 && (
                                        <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-500">
                                            +{project.skills.length - 4}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </button>
                    );
                })}
            </div>

            {/* 모달 상세 */}
            {selected && (
                <CardDetail
                    selected={selected}
                    setSelectedProject={setSelectedProject}
                />
            )}
        </>
    );
};
