import { useTranslation } from "react-i18next";
import { useHandlePushPath } from "../../../hooks/useHandlePushPath";
import { PROJECTS, RESUME } from "../../../routes/route";

const GROUPS = [
    { title: "Frontend", items: ["React", "TypeScript", "Tailwind CSS", "Redux"], description: "frontend", examples: "frontendExamples" },
    { title: "Backend", items: ["Java", "Spring Boot", "PostgreSQL", "Oracle"], description: "backend", examples: "backendExamples" },
] as const;

export const Skills = () => {
    const { t } = useTranslation();
    const navigate = useHandlePushPath();
    return <section className="profile-section" aria-labelledby="profile-skills">
        <h2 id="profile-skills">{t("pages.profile.skills")}</h2>
        <div className="skill-groups">
            {GROUPS.map(group => <div key={group.title} className="skill-group">
                <h3>{group.title}</h3>
                <ul className="skill-tags">{group.items.map(item => <li key={item}>{item}</li>)}</ul>
                <p>{t(`pages.profile.skillEvidence.${group.description}`)}</p>
                <p className="skill-evidence">{t(`pages.profile.skillEvidence.${group.examples}`)}</p>
            </div>)}
        </div>
        <div className="profile-evidence-links">
            <button type="button" className="profile-work-link" onClick={() => navigate(PROJECTS)}>{t("pages.home.viewProjects")}</button>
            <button type="button" className="profile-work-link" onClick={() => navigate(RESUME)}>{t("routes.resume")}</button>
        </div>
    </section>;
};
