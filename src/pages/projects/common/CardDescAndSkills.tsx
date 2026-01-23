import type {Project} from "../mocks/projectData";

interface CardDescAndSkillsProps {
    project: Project;
}

export const CardDescAndSkills = ({project}: CardDescAndSkillsProps) => {
    const convertNewDetailedDescription =
        project.detailedDescription.split(".");

    return (
        <div className="w-full flex flex-col justify-between gap-2">
            <div className="w-full">
                {convertNewDetailedDescription.map((desc, descIndex) => {
                    if (desc.trim() === "") return null;
                    return (
                        <p key={descIndex} className="text-sm leading-relaxed">
                            {desc.trim()}.
                        </p>
                    );
                })}
            </div>

            <div className="flex flex-col gap-2">
                <p className="font-bold text-lg">기술 스택</p>
                <div className="flex flex-wrap gap-2">
                    {project.skills.map((skill, skillIndex) => (
                        <span
                            key={skillIndex}
                            className="bg-black/80 text-white px-2 py-1 rounded-[5px] text-sm"
                        >
                            {skill}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
};
