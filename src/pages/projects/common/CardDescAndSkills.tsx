import type { Project } from "../mocks/projectData";
import { useTranslation } from "react-i18next";

interface CardDescAndSkillsProps {
    project: Project;
}

export const CardDescAndSkills = ({ project }: CardDescAndSkillsProps) => {
    const { t } = useTranslation();
    const convertNewDetailedDescription = project.detailedDescription.split(".");

    return (
        <div className="w-full flex flex-col gap-6">
            {/* 프로젝트 설명 섹션 */}
            <div className="w-full space-y-3">
                <div className="flex items-center gap-2">
                    <div className="h-5 w-1 rounded-full bg-primary" />
                    <h4 className="text-base font-semibold text-slate-100">{t("pages.projects.projectIntro")}</h4>
                </div>
                <div className="space-y-2 pl-3">
                    {convertNewDetailedDescription.map((desc, descIndex) => {
                        if (desc.trim() === "") return null;
                        return (
                            <p
                                key={descIndex}
                                className="text-sm leading-relaxed text-slate-300"
                            >
                                {desc.trim()}.
                            </p>
                        );
                    })}
                </div>
            </div>

            {/* 기술 스택 섹션 */}
            <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                    <div className="h-5 w-1 rounded-full bg-primary" />
                    <h4 className="text-base font-semibold text-slate-100">{t("pages.projects.techStack")}</h4>
                </div>
                <div className="flex flex-wrap gap-2 pl-3">
                    {project.skills.map((skill, skillIndex) => (
                        <span
                            key={skillIndex}
                            className={[
                                "group relative inline-flex items-center gap-1.5 overflow-hidden",
                                "rounded-lg border border-primary/30 bg-linear-to-br from-primary/10 to-primary/15",
                                "px-3 py-1.5 text-sm font-medium text-slate-200",
                                "transition-all duration-200",
                                "hover:border-primary/50 hover:shadow-md hover:shadow-primary/20 hover:-translate-y-0.5",
                            ].join(" ")}
                        >
                            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                            {skill}
                        </span>
                    ))}
                </div>
            </div>

            {/* 팀 멤버 섹션 */}
            {project.projectMembers && project.projectMembers.length > 0 && (
                <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                        <div className="h-5 w-1 rounded-full bg-primary" />
                        <h4 className="text-base font-semibold text-slate-100">{t("pages.projects.team")}</h4>
                    </div>
                    <div className="flex flex-wrap gap-2 pl-3">
                        {project.projectMembers.map((member, index) => (
                            <span
                                key={index}
                                className="inline-flex items-center gap-1.5 rounded-full border border-[#3e3e42] bg-[#2a2a2d] px-3 py-1 text-sm text-slate-300"
                            >
                                <svg className="h-3.5 w-3.5 text-slate-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                </svg>
                                {member}
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
