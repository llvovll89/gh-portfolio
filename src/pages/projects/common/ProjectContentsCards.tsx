import {Link} from "react-router-dom";
import {projects} from "../mocks/projectData";
import {Img} from "../../../components/Img";

interface CardProps {
    className?: string;
}

export const ProjectContentsCards = ({className}: CardProps) => {
    return (
        <>
            {projects.map((project, index) => (
                <section
                    key={index}
                    className={`border border-gray-400/50 p-4 m-2 rounded flex flex-col gap-1 shadow-2xs ${className} relative`}
                >
                    <h2 className="text-2xl font-bold">{project.title}</h2>

                    <article id="main_image" className="h-75">
                        <Img src={project.image} className="w-full h-full" />
                    </article>

                    <div className="w-full flex gap-1 items-center justify-center absolute bottom-4 left-1/2 -translate-x-1/2">
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
                </section>
            ))}
        </>
    );
};
