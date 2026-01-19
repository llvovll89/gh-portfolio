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
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setSelectedProject(null)}
            role="dialog"
            aria-modal="true"
        >
            <div
                className="w-full max-w-3xl rounded-xl border border-white/10 bg-[#0b0b0f] p-4 md:p-6 relative"
                onClick={(e) => e.stopPropagation()}
            >
                <CardHeader
                    project={selected}
                    onClose={() => setSelectedProject(null)}
                />
                <div className="mt-3">
                    <CardDescAndSkills project={selected} />
                </div>

                <div className="mt-5 flex flex-wrap items-center justify-end gap-2">
                    <a
                        href={selected.link.projectUrl}
                        className="text-white bg-primary/80 px-3 py-2 hover:underline rounded-md text-sm"
                        target="_blank"
                        rel="noreferrer"
                    >
                        프로젝트 보기
                    </a>
                    <a
                        href={selected.link.repositoryUrl}
                        className="text-white bg-primary/80 px-3 py-2 hover:underline rounded-md text-sm"
                        target="_blank"
                        rel="noreferrer"
                    >
                        깃허브 저장소
                    </a>
                </div>
            </div>
        </div>
    );
};
