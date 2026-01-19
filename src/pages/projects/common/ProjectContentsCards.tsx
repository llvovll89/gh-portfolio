import {useMemo, useState} from "react";
import {projects} from "../mocks/projectData";
import {CardDetail} from "./CardDetail";

interface CardProps {
    className?: string;
}

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
                className={`grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 ${className ?? ""}`}
            >
                {projects.map((project, index) => (
                    <button
                        type="button"
                        key={`${project.title}-${index}`}
                        onClick={() => setSelectedProject(index)}
                        className={
                            "cursor-pointer text-left rounded-xl border border-white/10 bg-white/5 p-4 hover:bg-white/10 hover:border-white/20 transition focus:outline-none focus:ring-2 focus:ring-primary/70"
                        }
                    >
                        <div className="flex items-start justify-between gap-3">
                            <h2 className="text-xl font-bold">
                                <span className="text-white/60 mr-2">
                                    {index + 1}.
                                </span>
                                {project.title}
                            </h2>
                            <span className="hover:border-primary hover:bg-primary transition-all text-xs text-white border border-white/15 px-2 py-1 rounded-md">
                                상세보기
                            </span>
                        </div>

                        <p className="mt-2 text-sm text-white/70 line-clamp-2">
                            {project.description}
                        </p>

                        <div className="mt-3 flex flex-wrap gap-2">
                            {(project.skills ?? [])
                                .slice(0, 4)
                                .map((s: string) => (
                                    <span
                                        key={s}
                                        className="text-xs text-white/70 bg-black/30 border border-white/10 px-2 py-1 rounded-full"
                                    >
                                        {s}
                                    </span>
                                ))}
                        </div>
                    </button>
                ))}
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
