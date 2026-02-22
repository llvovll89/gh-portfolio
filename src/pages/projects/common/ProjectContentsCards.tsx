import { useMemo, useState } from "react";
import { projects } from "../mocks/projectData";
import { CardDetail } from "./CardDetail";

interface CardProps {
    className?: string;
}

export const ProjectContentsCards = ({ className }: CardProps) => {
    const [selectedProject, setSelectedProject] = useState<number | null>(null);

    const selected = useMemo(
        () => (selectedProject === null ? null : projects[selectedProject]),
        [selectedProject],
    );

    return (
        <>
            {/* 컴팩트 리스트 */}
            <div className={`flex flex-col gap-2 ${className ?? ""}`}>
                {projects.map((project, index) => {
                    const isSelected = selectedProject === index;

                    const isUpdating = project.status === "updating";
                    const isIncomplete = project.status === "incomplete";

                    return (
                        <button
                            type="button"
                            key={`${project.title}-${index}`}
                            onClick={() => !isUpdating && setSelectedProject(index)}
                            disabled={isUpdating}
                            className={[
                                "group relative flex sm:flex-row flex-col items-start sm:gap-4 gap-2 p-4 rounded-lg border text-left",
                                "bg-[#181818] transition-all duration-200",
                                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70",
                                isUpdating
                                    ? "cursor-not-allowed opacity-60 border-[#3e3e42]"
                                    : isSelected
                                    ? "cursor-pointer border-primary bg-[#000000] shadow-[0_0_0_1px_rgba(59,130,246,0.35)]"
                                    : "cursor-pointer border-[#3e3e42] hover:border-[#CECECE] hover:bg-[rgba(0,0,0,0.12)]",
                            ].join(" ")}
                        >
                            {/* 프로젝트 번호 */}
                            <div className="sm:static absolute z-1 shrink-0 flex items-center justify-center sm:w-8 sm:h-8 w-7 h-7 left-2 top-2 rounded-full sm:bg-[#2a2a2d] bg-[#121212] border sm:border-[#3e3e42] border-[#CECECE]/20 text-xs font-semibold text-slate-400">
                                {index + 1}
                            </div>

                            {/* 썸네일 이미지 */}
                            <div className="relative shrink-0 w-full h-34 sm:w-24 sm:h-24 rounded-md overflow-hidden bg-[#252526] border border-[#3e3e42]">
                                <img
                                    src={project.image}
                                    alt={project.title}
                                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                                />

                                {/* 업데이트 중 오버레이 */}
                                {isUpdating && (
                                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                        <span className="inline-flex items-center gap-1 rounded-full border border-sky-400/50 bg-sky-500/20 px-2 py-1 text-[10px] font-semibold text-sky-300">
                                            <span className="relative flex h-1.5 w-1.5">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75" />
                                                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-sky-400" />
                                            </span>
                                            업데이트 중
                                        </span>
                                    </div>
                                )}

                                {/* 호버 오버레이 */}
                                {!isUpdating && (
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                                        <span className="text-white text-xs font-medium">→</span>
                                    </div>
                                )}
                            </div>

                            {/* 프로젝트 정보 */}
                            <div className="flex-1 min-w-0 space-y-2">
                                <div className="space-y-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <h2 className="text-base md:text-lg font-semibold text-slate-100 group-hover:text-primary transition-colors duration-200">
                                            {project.title}
                                        </h2>
                                        <span className="h-1 w-1 rounded-full bg-slate-600" />
                                        <span className="text-[clamp(0.65rem,1vw,0.9rem)] text-slate-400">
                                            {project.scale}
                                        </span>
                                        {isIncomplete && (
                                            <span className="inline-flex items-center rounded-full border border-amber-500/40 bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-400">
                                                미완성
                                            </span>
                                        )}
                                        {isUpdating && (
                                            <span className="inline-flex items-center rounded-full border border-sky-400/40 bg-sky-500/10 px-2 py-0.5 text-[10px] font-semibold text-sky-400">
                                                업데이트 중
                                            </span>
                                        )}
                                    </div>

                                    <p className="text-[clamp(0.75rem,1vw,1rem)] text-slate-400 line-clamp-2">
                                        {project.description}
                                    </p>
                                </div>

                                {/* 스킬 태그 */}
                                <div className="flex flex-wrap gap-1.5">
                                    {(project.skills ?? [])
                                        .slice(0, 5)
                                        .map((s: string) => (
                                            <span
                                                key={s}
                                                className="inline-flex items-center gap-1 rounded border border-[#3e3e42] bg-[#2a2a2d] px-2 py-0.5 text-[10px] font-medium text-slate-300 transition-colors group-hover:border-primary/30 group-hover:bg-primary/10"
                                            >
                                                <span className="h-1 w-1 rounded-full bg-primary" />
                                                {s}
                                            </span>
                                        ))}
                                    {project.skills.length > 5 && (
                                        <span className="inline-flex items-center rounded bg-[#2a2a2d] px-2 py-0.5 text-[10px] font-medium text-slate-500">
                                            +{project.skills.length - 5}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* 상세보기 아이콘 */}
                            <div className="sm:block hidden shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                <div className="flex items-center justify-center w-8 h-8 rounded bg-primary/10 text-primary">
                                    <span className="text-sm">→</span>
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
