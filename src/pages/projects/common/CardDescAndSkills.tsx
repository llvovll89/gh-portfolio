import type { Project } from "../mocks/projectData";

interface CardDescAndSkillsProps {
    project: Project;
}

export const CardDescAndSkills = ({ project }: CardDescAndSkillsProps) => {
    return (
        <div className="w-full flex flex-col justify-between gap-2">
            <div className="w-full text-white">
                <p>{project.description}</p>
            </div>

            <div className="flex flex-col gap-2">
                <p className="font-bold text-lg">기술 스택</p>
                <div className="flex flex-wrap gap-2">
                    {project.skills.map((skill, skillIndex) => (
                        <span
                            key={skillIndex}
                            className="bg-white/20 text-white px-2 py-1 rounded-[5px] text-sm"
                        >
                            {skill}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    )
};