import type { Project } from "../mocks/projectData";
import { useTranslation } from "react-i18next";

export const CardDescAndSkills = ({ project }: { project: Project }) => {
    const { t } = useTranslation();
    return (
        <div className="project-detail-sections">
            {project.role && <div className="project-detail-role"><h3>{t("pages.projects.role")}</h3><p>{project.role}</p></div>}
            {project.challenge && <section><h3>{t("pages.projects.challenge")}</h3><p>{project.challenge}</p></section>}
            {!!project.contributions?.length && <section><h3>{t("pages.projects.contributions")}</h3><ul>{project.contributions.map(item => <li key={item}>{item}</li>)}</ul></section>}
            {project.outcome && <section><h3>{t("pages.projects.outcome")}</h3><p>{project.outcome}</p></section>}
            <section><h3>{t("pages.projects.projectIntro")}</h3><p>{project.detailedDescription}</p></section>
            <section><h3>{t("pages.projects.techStack")}</h3><div className="project-detail-tags">{project.skills.map(skill => <span key={skill}>{skill}</span>)}</div></section>
            {!!project.projectMembers?.length && <section><h3>{t("pages.projects.team")}</h3><p>{project.projectMembers.join(", ")}</p></section>}
        </div>
    );
};
