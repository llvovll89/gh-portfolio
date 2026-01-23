import type {Project} from "../mocks/projectData";
import {CardDescAndSkills} from "./CardDescAndSkills";
import {CardHeader} from "./CardHeader";

interface CardDetailProps {
    selected: Project;
    setSelectedProject: (index: number | null) => void;
}

export const CardDetail = ({selected, setSelectedProject}: CardDetailProps) => {
    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/55 backdrop-blur-md"
            onClick={() => setSelectedProject(null)}
            role="dialog"
            aria-modal="true"
        >
            <div
                className={[
                    "relative w-full max-w-3xl overflow-hidden rounded-2xl",
                    "border border-slate-200/80 bg-white text-slate-900",
                    "shadow-[0_30px_90px_rgba(2,6,23,0.35)]",
                ].join(" ")}
                onClick={(e) => e.stopPropagation()}
            >
                {/* subtle highlight */}
                <div className="pointer-events-none absolute inset-0">
                    <div className="absolute -top-24 left-1/2 h-48 w-130 -translate-x-1/2 rounded-full bg-linear-to-r from-primary/18 via-fuchsia-400/14 to-sky-400/18 blur-3xl" />
                    <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-primary/30 to-transparent" />
                </div>

                <div className="relative p-4 md:p-6">
                    <CardHeader
                        project={selected}
                        onClose={() => setSelectedProject(null)}
                    />

                    <div className="mt-3">
                        <CardDescAndSkills project={selected} />
                    </div>

                    <div className="mt-6 flex flex-wrap items-center justify-end gap-2">
                        <a
                            href={selected.link.projectUrl}
                            className={[
                                "inline-flex items-center justify-center rounded-lg px-3.5 py-2 text-sm font-medium",
                                "bg-primary text-white",
                                "shadow-sm shadow-primary/20",
                                "transition-colors",
                                "hover:bg-primary/90",
                                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2",
                            ].join(" ")}
                            target="_blank"
                            rel="noreferrer"
                        >
                            프로젝트 보기
                        </a>

                        <a
                            href={selected.link.repositoryUrl}
                            className={[
                                "inline-flex items-center justify-center rounded-lg px-3.5 py-2 text-sm font-medium",
                                "border border-slate-200 bg-white text-slate-800",
                                "transition-colors",
                                "hover:bg-slate-50",
                                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2",
                            ].join(" ")}
                            target="_blank"
                            rel="noreferrer"
                        >
                            깃허브 저장소
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};
