import { Link } from "react-router-dom";
import { projects } from "../mocks/projectData";
import { Img } from "../../../components/Img";
import { useState } from "react";
import { CardHeader } from "./CardHeader";
import { CardDescAndSkills } from "./CardDescAndSkills";

interface CardProps {
    className?: string;
}

export const ProjectContentsCards = ({ className }: CardProps) => {
    const [selectedProject, setSelectedProject] = useState<number | null>(null);

    const handleCardClick = (index: number) => {
        setSelectedProject(index === selectedProject ? null : index);
    };

    return (
        <>
            {projects.map((project, index) => (
                <section
                    onClick={() => handleCardClick(index)}
                    key={index}
                    className={`cursor-pointer hover:bg-primary/20 transition-all border border-gray-400/50 p-4 m-2 rounded flex flex-col gap-1 shadow-2xs ${className} relative`}
                >
                    <h2 className="text-2xl font-bold">{project.title}</h2>

                    <article id="main_image" className="h-full">
                        <Img src={project.image} className="w-full h-full" />
                    </article>

                    {selectedProject === index && (
                        <div className="w-full h-full bg-black/90 z-1 flex flex-col gap-3 items-center absolute top-0 left-0 p-4 rounded">
                            <CardHeader project={project} onClose={() => setSelectedProject(null)} />
                            <CardDescAndSkills project={project} />

                            <div className="w-full flex items-center justify-center gap-2 text-sm absolute bottom-4">
                                <Link
                                    key={index}
                                    to={project.link.projectUrl}
                                    className="text-white bg-primary/80 px-2 py-1 hover:underline rounded-[5px]"
                                >
                                    프로젝트 보기
                                </Link>
                                <Link
                                    key={index}
                                    to={project.link.repositoryUrl}
                                    className="text-white bg-primary/80 px-2 py-1 hover:underline rounded-[5px]"
                                >
                                    깃허브 저장소
                                </Link>
                            </div>
                        </div>
                    )}
                </section>
            ))}
        </>
    );
};
