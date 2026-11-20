import { OptimizedImage } from "../../../../components/OptimizedImage";
import { useMemo, type CSSProperties } from "react";
import { useTranslation } from "react-i18next";
import { LuArrowRight, LuArrowUpRight, LuMail } from "react-icons/lu";
import { useHandlePushPath } from "../../../../hooks/useHandlePushPath";
import { BLOG, CONTACT, PROFILE, PROJECTS } from "../../../../routes/route";
import { Link } from "react-router-dom";
import { projectPath, useProjects } from "../../../projects/useProjects";
import { ProjectPreview } from "../../../projects/common/ProjectPreview";
import { careers } from "../../../profile/careerData";
import { SKILL_GROUPS } from "../../../profile/skillData";
import { loadAllPosts } from "../../../../utils/loadAllPosts";
import { sortPosts } from "../../../../utils/blogFilters";

// 코드 패널의 한 줄을 구성하는 토큰 (색은 CSS 클래스로 테마 변수에 연결)
type Token = { kind: "kw" | "key" | "str" | "punct"; text: string };

const RECENT_POST_COUNT = 4;
const recentPosts = sortPosts(loadAllPosts().filter(post => post.category !== "Notes"), "desc").slice(0, RECENT_POST_COUNT);

const str = (value: string): Token[] => [{ kind: "str", text: `"${value}"` }];
const list = (values: readonly string[]): Token[] => [
    { kind: "punct", text: "[" },
    ...values.flatMap((value, index) => [...str(value), ...(index < values.length - 1 ? [{ kind: "punct" as const, text: ", " }] : [])]),
    { kind: "punct", text: "]" },
];
// "2023. 07 - 2026. 02" → "2023.07 ~ 2026.02"
const formatPeriod = (period: string) => period.replace(/\.\s/g, ".").replace(/\s*-\s*/, " ~ ").trim();
const field = (key: string, value: Token[]): Token[] => [
    { kind: "punct", text: "  " }, { kind: "key", text: key }, { kind: "punct", text: ": " }, ...value, { kind: "punct", text: "," },
];

export const MainContents = () => {
    const { t } = useTranslation();
    const handlePushPath = useHandlePushPath();
    const projects = useProjects();
    const featuredProjects = projects.filter(project => project.featured).sort((a, b) => (a.featuredOrder ?? 99) - (b.featuredOrder ?? 99));
    const otherProjects = projects.filter(project => !project.featured && !project.archived);

    const codeLines = useMemo<Token[][]>(() => {
        const [current, previous] = careers;
        const company = (key: string) => t(`pages.profile.personalHistory.${key}`);
        return [
            [{ kind: "kw", text: "export const " }, { kind: "key", text: "geonho" }, { kind: "punct", text: " = {" }],
            field("role", str("Full-stack Web Developer")),
            field("now", str(`${company(current.company)}, ${formatPeriod(current.period)}`)),
            field("before", str(`${company(previous.company)}, ${formatPeriod(previous.period)}`)),
            field("frontend", list(SKILL_GROUPS[0].items.slice(0, 3))),
            field("backend", list(SKILL_GROUPS[1].items.slice(1, 4))),
            field("shipped", list(featuredProjects.map(project => project.title))),
            [{ kind: "punct", text: "};" }],
        ];
    }, [t, featuredProjects]);

    return (
        <article className="portfolio-home">
            <section className="home-intro">
                <div className="home-intro-text">
                    <div className="home-byline">
                        <OptimizedImage src="/assets/images/kimgeonho/증명사진.png" alt="" sizes="40px" width="40" height="40" />
                        <p>Geonho Kim <span>{t("pages.home.badge")}</span></p>
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

                {/* 사이트 컨셉(에디터)을 본문으로 끌어오는 유일한 연출 요소 */}
                <figure className="home-code" aria-label={t("pages.home.codeLabel")}>
                    <div className="home-code-tab" aria-hidden="true"><span>profile.ts</span></div>
                    <pre className="home-code-body"><code>
                        {codeLines.map((line, index) => (
                            <span key={index} className="home-code-line" style={{ "--line": index } as CSSProperties}>
                                <span className="home-code-gutter" aria-hidden="true">{index + 1}</span>
                                <span className="home-code-text">
                                    {line.map((token, tokenIndex) => <span key={tokenIndex} className={`tok-${token.kind}`}>{token.text}</span>)}
                                    {index === codeLines.length - 1 && <span className="home-code-caret" aria-hidden="true" />}
                                </span>
                            </span>
                        ))}
                    </code></pre>
                    <figcaption className="home-code-footer">
                        <Link to={PROFILE}>{t("pages.home.viewProfile")} <LuArrowUpRight aria-hidden="true" /></Link>
                    </figcaption>
                </figure>
            </section>

            <section className="home-section" aria-labelledby="home-featured-title">
                <div className="home-section-head">
                    <h2 id="home-featured-title">{t("pages.home.featured")}</h2>
                    <Link to={PROJECTS} className="home-more-link">{t("pages.projects.viewAll")} <LuArrowUpRight aria-hidden="true" /></Link>
                </div>
                <div className="home-featured">
                    {featuredProjects.map((project, index) => (
                        <Link key={project.id} className="home-feature" to={projectPath(project)} viewTransition>
                            <div className="home-feature-image"><ProjectPreview project={project} eager={index === 0} /></div>
                            <div className="home-feature-caption">
                                <h3>{project.title}</h3>
                                <LuArrowUpRight aria-hidden="true" />
                            </div>
                            <p className="home-feature-summary">{project.outcome ?? project.description}</p>
                            <p className="home-feature-stack">{project.skills.slice(0, 3).join(" / ")}</p>
                        </Link>
                    ))}
                </div>
            </section>

            <div className="home-split">
                {otherProjects.length > 0 && (
                    <section className="home-section" aria-labelledby="home-more-title">
                        <div className="home-section-head"><h2 id="home-more-title">{t("pages.home.moreWork")}</h2></div>
                        <ul className="home-rows">
                            {otherProjects.map(project => (
                                <li key={project.id}>
                                    <Link className="home-row" to={projectPath(project)} viewTransition>
                                        <span className="home-row-title">{project.title}</span>
                                        <span className="home-row-desc">{project.description}</span>
                                        <LuArrowUpRight aria-hidden="true" />
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </section>
                )}
                {recentPosts.length > 0 && (
                    <section className="home-section" aria-labelledby="home-posts-title">
                        <div className="home-section-head">
                            <h2 id="home-posts-title">{t("pages.home.recentPosts")}</h2>
                            <Link to={BLOG} className="home-more-link">{t("pages.home.allPosts")} <LuArrowUpRight aria-hidden="true" /></Link>
                        </div>
                        <ul className="home-rows">
                            {recentPosts.map(post => (
                                <li key={post.slug}>
                                    <Link className="home-row home-row-post" to={`/blog/${post.slug}`}>
                                        <time className="home-row-date" dateTime={post.date}>{post.date}</time>
                                        <span className="home-row-title">{post.title}</span>
                                        <LuArrowUpRight aria-hidden="true" />
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </section>
                )}
            </div>
        </article>
    );
};
