import { useState } from "react";
import { useTranslation } from "react-i18next";
import { LuArrowRight, LuArrowUpRight, LuMail } from "react-icons/lu";
import { useHandlePushPath } from "../../../../hooks/useHandlePushPath";
import { CONTACT, PROJECTS } from "../../../../routes/route";
import { projects, type Project } from "../../../projects/mocks/projectData";
import { CardDetail } from "../../../projects/common/CardDetail";

export const MainContents = () => {
    const { t } = useTranslation();
    const handlePushPath = useHandlePushPath();
    const [selected, setSelected] = useState<Project | null>(null);
    const featuredProjects = projects.filter(project => project.featured);
    const [spotlightIndex, setSpotlightIndex] = useState(0);
    const spotlight = featuredProjects[spotlightIndex];
    return (
        <article className="portfolio-home">
            <section className="home-intro">
                <div>
                    <div className="home-byline">
                        <img src="/assets/images/kimgeonho/증명사진.png" alt="" width="40" height="40" />
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
                    <div className="home-spotlight-tabs" aria-label={t("pages.projects.featuredProjects")}>
                        {featuredProjects.map((project, index) => (
                            <button type="button" key={project.id} aria-pressed={spotlightIndex === index} onClick={() => setSpotlightIndex(index)}>{project.title}</button>
                        ))}
                    </div>
                    <button type="button" className="home-spotlight-project" onClick={() => setSelected(spotlight)}>
                        <div className="home-spotlight-image"><img key={spotlight.id} src={spotlight.image} alt={spotlight.title} width="800" height="600" /></div>
                        <div className="home-spotlight-caption">
                            <div><h2>{spotlight.title}</h2><p>{spotlight.skills.slice(0, 3).join(" / ")}</p></div>
                            <LuArrowUpRight aria-hidden="true" />
                        </div>
                    </button>
                </div>
            </section>
            <section className="home-work" aria-labelledby="home-work-title">
                <h2 id="home-work-title">{t("pages.projects.featuredProjects")}</h2>
                <div className="home-projects">
                    {projects.filter(project => !project.featured).slice(0, 2).map(project => (
                        <button key={project.id} type="button" className="home-project" onClick={() => setSelected(project)}>
                            <div className="home-project-image"><img src={project.image} alt={project.title} width="800" height="450" /></div>
                            <div className="home-project-caption"><h3>{project.title}</h3><LuArrowUpRight aria-hidden="true" /></div>
                            <p>{project.skills.slice(0, 3).join(" / ")}</p>
                        </button>
                    ))}
                </div>
            </section>
            {selected && <CardDetail selected={selected} setSelectedProject={() => setSelected(null)} />}
        </article>
    );
};
