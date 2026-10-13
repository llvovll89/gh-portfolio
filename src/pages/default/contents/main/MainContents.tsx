import { OptimizedImage } from "../../../../components/OptimizedImage";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { LuArrowRight, LuArrowUpRight, LuMail } from "react-icons/lu";
import { useHandlePushPath } from "../../../../hooks/useHandlePushPath";
import { CONTACT, PROJECTS } from "../../../../routes/route";
import { Link } from "react-router-dom";
import { projectPath, useProjects } from "../../../projects/useProjects";
import { ProjectPreview } from "../../../projects/common/ProjectPreview";

export const MainContents = () => {
    const { t } = useTranslation();
    const handlePushPath = useHandlePushPath();
    const projects = useProjects();
    const featuredProjects = projects.filter(project => project.featured).sort((a, b) => (a.featuredOrder ?? 99) - (b.featuredOrder ?? 99));
    const supportingProjects = projects.filter(project => !project.featured).slice(0, 2);
    const [spotlightIndex, setSpotlightIndex] = useState(0);
    const spotlight = featuredProjects[spotlightIndex];
    return (
        <article className="portfolio-home">
            <section className="home-intro">
                <div>
                    <div className="home-byline">
                        <OptimizedImage src="/assets/images/kimgeonho/증명사진.png" alt="" sizes="40px" width="40" height="40" />
                        <p>Geon Ho Kim <span>{t("pages.home.badge")}</span></p>
                    </div>
                    <h1>{t("pages.home.headlineLine1")}<span>{t("pages.home.headlineLine2")}</span></h1>
                    <p className="home-summary">{t("pages.home.summary")}</p>
                    <div className="home-actions">
                        <button type="button" onClick={() => handlePushPath(PROJECTS)} className="workbench-button workbench-button-primary">
                            {t("pages.home.viewProjects")} <LuArrowRight aria-hidden="true" />
                        </button>
                        <button type="button" onClick={() => handlePushPath(CONTACT)} className="workbench-button">
                            <LuMail aria-hidden="true" /> {t("pages.home.getInTouch")}
                        </button>
                    </div>
                </div>
                <div className="home-spotlight">
                    <div className="home-spotlight-tabs" role="group" aria-label={t("pages.projects.featuredProjects")}>
                        {featuredProjects.map((project, index) => (
                            <button type="button" key={project.id} aria-pressed={spotlightIndex === index} onClick={() => setSpotlightIndex(index)}>{project.title}</button>
                        ))}
                    </div>
                    <Link className="home-spotlight-project" to={projectPath(spotlight)}>
                        <div className="home-spotlight-image"><ProjectPreview project={spotlight} eager /></div>
                        <div className="home-spotlight-caption">
                            <div><h2>{spotlight.title}</h2><p className="home-project-summary">{spotlight.outcome ?? spotlight.description}</p><p>{spotlight.skills.slice(0, 3).join(" / ")}</p></div>
                            <LuArrowUpRight aria-hidden="true" />
                        </div>
                    </Link>
                </div>
            </section>
            <section className="home-work" aria-labelledby="home-work-title">
                <h2 id="home-work-title">{t("pages.projects.featuredProjects")}</h2>
                <div className="home-projects">
                    {supportingProjects.map(project => (
                        <Link key={project.id} className="home-project" to={projectPath(project)}>
                            <div className="home-project-image"><ProjectPreview project={project} /></div>
                            <div className="home-project-caption"><h3>{project.title}</h3><LuArrowUpRight aria-hidden="true" /></div>
                            <p className="home-project-summary">{project.description}</p>
                            <p>{project.skills.slice(0, 3).join(" / ")}</p>
                        </Link>
                    ))}
                </div>
            </section>
        </article>
    );
};
