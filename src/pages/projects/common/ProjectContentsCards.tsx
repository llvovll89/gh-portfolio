import {useMemo, useState} from "react";
import {projects} from "../mocks/projectData";
import {CardDetail} from "./CardDetail";

interface CardProps {
    className?: string;
}

// ...existing code...

export const ProjectContentsCards = ({className}: CardProps) => {
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
                                "cursor-pointer group relative flex h-full flex-col justify-between overflow-hidden rounded-2xl border px-4 py-5 text-left",
                                "bg-white shadow-lg",
                                "transition-all duration-200 ease-out",
                                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-100",
                                isSelected
                                    ? "border-primary/70 shadow-[0_0_0_1px_rgba(59,130,246,0.35),0_18px_45px_rgba(15,23,42,0.14)]"
                                    : "border-slate-200/80 hover:-translate-y-1 hover:border-primary/50 hover:bg-white hover:shadow-[0_18px_45px_rgba(15,23,42,0.10)]",
                            ].join(" ")}
                        >
                            {/* 그라디언트 하이라이트 */}
                            <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                <div className="absolute inset-x-0 -top-1 h-20 bg-linear-to-r from-primary/15 via-fuchsia-400/12 to-sky-400/18 blur-2xl" />
                            </div>

                            <div className="relative flex items-start justify-between gap-3">
                                <div className="space-y-1.5">
                                    <div className="flex items-center gap-2">
                                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-900/3 text-[10px] font-medium text-slate-600 ring-1 ring-slate-200/80">
                                            {index + 1}
                                        </span>
                                        <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400/90">
                                            Project
                                        </p>
                                    </div>

                                    <h2 className="text-lg md:text-xl font-semibold tracking-tight text-slate-900">
                                        {project.title}
                                    </h2>
                                </div>

                                <span
                                    className={[
                                        "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-medium",
                                        "border-slate-200/80 bg-slate-50 text-slate-700",
                                        "transition-colors duration-150",
                                        "group-hover:border-primary/80 group-hover:bg-primary group-hover:text-white",
                                    ].join(" ")}
                                >
                                    <span>상세보기</span>
                                    <span className="text-[10px] translate-y-[0.5px] group-hover:translate-x-0.5 transition-transform">
                                        →
                                    </span>
                                </span>
                            </div>

                            <p className="relative mt-3 text-sm leading-relaxed text-slate-600 line-clamp-3">
                                {project.description}
                            </p>

                            <div className="relative mt-4 flex flex-wrap gap-2">
                                {(project.skills ?? [])
                                    .slice(0, 4)
                                    .map((s: string) => (
                                        <span
                                            key={s}
                                            className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-700 backdrop-blur-sm"
                                        >
                                            <span className="mr-1 h-1.5 w-1.5 rounded-full bg-linear-to-tr from-primary to-sky-400" />
                                            {s}
                                        </span>
                                    ))}
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
