import type { Project } from "../mocks/projectData";
import { useTranslation } from "react-i18next";

export const CardDescAndSkills = ({ project, headingLevel = 3 }: { project: Project; headingLevel?: 2 | 3 }) => {
    const { t } = useTranslation();
    const Heading = headingLevel === 2 ? "h2" : "h3";
    return (
        <div className="project-detail-sections">
            {project.role && <div className="project-detail-role"><Heading>{t("pages.projects.role")}</Heading><p>{project.role}</p></div>}
            {project.challenge && <section><Heading>{t("pages.projects.challenge")}</Heading><p>{project.challenge}</p></section>}
            {!!project.contributions?.length && <section><Heading>{t("pages.projects.contributions")}</Heading><ul>{project.contributions.map(item => <li key={item}>{item}</li>)}</ul></section>}
            {project.outcome && <section><Heading>{t("pages.projects.outcome")}</Heading><p>{project.outcome}</p></section>}
            <section><Heading>{t("pages.projects.projectIntro")}</Heading><p>{project.detailedDescription}</p></section>
            <section><Heading>{t("pages.projects.techStack")}</Heading><div className="project-detail-tags">{project.skills.map(skill => <span key={skill}>{skill}</span>)}</div></section>
            {!!project.projectMembers?.length && <section><Heading>{t("pages.projects.team")}</Heading><p>{project.projectMembers.join(", ")}</p></section>}
        </div>
    );
};
