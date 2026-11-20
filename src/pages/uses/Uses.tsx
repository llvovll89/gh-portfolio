import { useTranslation } from "react-i18next";
import { uiText } from "../../utils/uiText";
import { Aside } from "../../components/aside/Aside";
import { Contents } from "../../components/contents/Contents";
import { Header } from "../../components/header/Header";
import { FaReact, FaGithub, FaFigma, FaSlack } from "react-icons/fa";
import { GrOracle } from "react-icons/gr";
import { TbBrandTypescript, TbBrandVscode } from "react-icons/tb";
import { SiPostman, SiTailwindcss, SiPostgresql, SiJira, SiFirebase } from "react-icons/si";
import { BiLogoSpringBoot } from "react-icons/bi";
import { useSeoMeta } from "../../hooks/useSeoMeta";
import { PageHeader } from "../../components/pageHeader/PageHeader";
import { LuArrowUpRight } from "react-icons/lu";

export const Uses = () => {
    const { t } = useTranslation();
    useSeoMeta({ title: "Uses", description: uiText("김건호가 사용하는 개발 도구, 기술 스택, 환경 설정 소개"), url: "/uses" });
    const toolCategories = [
        {
            title: uiText("개발 도구"),
            description: uiText("일상적으로 사용하는 개발 도구들"),
            tools: [
                {
                    name: "Visual Studio Code",
                    icon: TbBrandVscode,
                    description: uiText("주력 코드 에디터"),
                    link: "https://code.visualstudio.com/",
                },
                {
                    name: "Git / GitHub",
                    icon: FaGithub,
                    description: uiText("버전 관리 및 협업"),
                    link: "https://github.com",
                },
                {
                    name: "Postman",
                    icon: SiPostman,
                    description: uiText("API 테스트 및 개발"),
                    link: "https://www.postman.com/",
                },
            ],
        },
        {
            title: uiText("기술 스택"),
            description: uiText("주로 사용하는 프레임워크 및 라이브러리"),
            tools: [
                {
                    name: "React",
                    icon: FaReact,
                    description: uiText("프론트엔드 프레임워크"),
                    link: "https://react.dev/",
                },
                {
                    name: "TypeScript",
                    icon: TbBrandTypescript,
                    description: uiText("타입 안정성을 위한 언어"),
                    link: "https://www.typescriptlang.org/",
                },
                {
                    name: "TailwindCSS",
                    icon: SiTailwindcss,
                    description: uiText("유틸리티 기반 CSS 프레임워크"),
                    link: "https://tailwindcss.com/",
                },
                {
                    name: "SpringBoot",
                    icon: BiLogoSpringBoot,
                    description: uiText("백엔드 프레임워크"),
                    link: "https://spring.io/projects/spring-boot",
                },
                {
                    name: "PostgreSQL",
                    icon: SiPostgresql,
                    description: uiText("오픈소스 관계형 데이터베이스"),
                    link: "https://www.postgresql.org/",
                },
                {
                    name: "Oracle",
                    icon: GrOracle,
                    description: uiText("엔터프라이즈 데이터베이스"),
                    link: "https://www.oracle.com/database/",
                },
                {
                    name: "Firebase",
                    icon: SiFirebase,
                    description: uiText("Auth, Firestore 등 BaaS 서비스"),
                    link: "https://firebase.google.com/",
                },
            ],
        },
        {
            title: uiText("디자인 & 협업"),
            description: uiText("디자인 및 팀 협업 도구"),
            tools: [
                {
                    name: "Figma",
                    icon: FaFigma,
                    description: uiText("UI/UX 디자인"),
                    link: "https://www.figma.com/",
                },
                {
                    name: "Jira",
                    icon: SiJira,
                    description: uiText("프로젝트 관리 및 이슈 트래킹"),
                    link: "https://www.atlassian.com/software/jira",
                },
                {
                    name: "Slack",
                    icon: FaSlack,
                    description: uiText("팀 커뮤니케이션"),
                    link: "https://slack.com/",
                },
            ],
        },
    ];

    return (
        <>
            <Header />
            <Aside />
            <Contents className="select-none">
                <section className="uses-page relative w-full max-w-6xl mx-auto px-2 md:px-6 pb-8">
                    <PageHeader title={t("pages.uses.title")} description={t("pages.uses.description")} />
                    {/* 같은 모양의 카드를 반복하는 대신 훑어보기 쉬운 목록으로 표시 */}
                    {toolCategories.map((category) => (
                        <section key={category.title} className="uses-group" aria-labelledby={`uses-${category.title}`}>
                            <h2 id={`uses-${category.title}`}>{category.title}</h2>
                            <p>{category.description}</p>
                            <ul className="uses-list">
                                {category.tools.map((tool) => (
                                    <li key={tool.name}>
                                        <a href={tool.link} target="_blank" rel="noopener noreferrer" className="uses-item">
                                            <tool.icon aria-hidden="true" focusable="false" />
                                            <span><strong>{tool.name}</strong><span>{tool.description}</span></span>
                                            <LuArrowUpRight aria-hidden="true" />
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </section>
                    ))}
                    <p className="uses-note">
                        {uiText("이 목록은 현재 활발히 사용 중인 도구들입니다. 프로젝트와 상황에 따라 다른 도구들도 유연하게 사용합니다.")}
                    </p>
                </section>
            </Contents>
        </>
    );
};
