import { Aside } from "../../components/aside/Aside";
import { Contents } from "../../components/contents/Contents";
import { Header } from "../../components/header/Header";
import { FaReact, FaGithub, FaFigma } from "react-icons/fa";
import { TbBrandTypescript, TbBrandVscode } from "react-icons/tb";
import { SiPostman, SiSlack, SiTailwindcss, SiPostgresql, SiOracle, SiJira } from "react-icons/si";
import { BiLogoSpringBoot } from "react-icons/bi";

export const Uses = () => {
    const toolCategories = [
        {
            title: "개발 도구",
            icon: "💻",
            description: "일상적으로 사용하는 개발 도구들",
            tone: "from-blue-500/15 via-cyan-400/10 to-sky-500/5",
            border: "border-blue-400/25",
            glowColor: "bg-blue-500/20",
            tools: [
                {
                    name: "Visual Studio Code",
                    icon: TbBrandVscode,
                    description: "주력 코드 에디터",
                    link: "https://code.visualstudio.com/",
                },
                {
                    name: "Git / GitHub",
                    icon: FaGithub,
                    description: "버전 관리 및 협업",
                    link: "https://github.com",
                },
                {
                    name: "Postman",
                    icon: SiPostman,
                    description: "API 테스트 및 개발",
                    link: "https://www.postman.com/",
                },
            ],
        },
        {
            title: "기술 스택",
            icon: "🛠️",
            description: "주로 사용하는 프레임워크 및 라이브러리",
            tone: "from-emerald-500/15 via-green-400/10 to-teal-500/5",
            border: "border-emerald-400/25",
            glowColor: "bg-emerald-500/20",
            tools: [
                {
                    name: "React",
                    icon: FaReact,
                    description: "프론트엔드 프레임워크",
                    link: "https://react.dev/",
                },
                {
                    name: "TypeScript",
                    icon: TbBrandTypescript,
                    description: "타입 안정성을 위한 언어",
                    link: "https://www.typescriptlang.org/",
                },
                {
                    name: "TailwindCSS",
                    icon: SiTailwindcss,
                    description: "유틸리티 기반 CSS 프레임워크",
                    link: "https://tailwindcss.com/",
                },
                {
                    name: "SpringBoot",
                    icon: BiLogoSpringBoot,
                    description: "백엔드 프레임워크",
                    link: "https://spring.io/projects/spring-boot",
                },
                {
                    name: "PostgreSQL",
                    icon: SiPostgresql,
                    description: "오픈소스 관계형 데이터베이스",
                    link: "https://www.postgresql.org/",
                },
                {
                    name: "Oracle",
                    icon: SiOracle,
                    description: "엔터프라이즈 데이터베이스",
                    link: "https://www.oracle.com/database/",
                },
            ],
        },
        {
            title: "디자인 & 협업",
            icon: "🎨",
            description: "디자인 및 팀 협업 도구",
            tone: "from-purple-500/15 via-pink-400/10 to-fuchsia-500/5",
            border: "border-purple-400/25",
            glowColor: "bg-purple-500/20",
            tools: [
                {
                    name: "Figma",
                    icon: FaFigma,
                    description: "UI/UX 디자인",
                    link: "https://www.figma.com/",
                },
                {
                    name: "Jira",
                    icon: SiJira,
                    description: "프로젝트 관리 및 이슈 트래킹",
                    link: "https://www.atlassian.com/software/jira",
                },
                {
                    name: "Slack",
                    icon: SiSlack,
                    description: "팀 커뮤니케이션",
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
                <section className="relative w-full max-w-7xl mx-auto overflow-auto scrolls px-2 md:px-6 py-4 md:py-8">
                    {/* 도구 카테고리 */}
                    <div className="space-y-8 md:space-y-12">
                        {toolCategories.map((category, idx) => (
                            <article key={idx} className="space-y-4 md:space-y-6">
                                {/* 카테고리 헤더 */}
                                <div className="flex items-center gap-3 md:gap-5">
                                    <div className="flex-1 md:flex-none md:w-20 h-px bg-linear-to-r from-transparent via-primary/50 to-primary" />
                                    <h2 className="text-[clamp(1.2rem,2.5vw,1.8rem)] shrink-0 whitespace-nowrap font-bold text-white/90 pr-2 flex items-center gap-2">
                                        <span className="text-2xl">{category.icon}</span>
                                        {category.title}
                                    </h2>
                                </div>

                                <p className="text-xs md:text-sm text-white/60 pl-4">
                                    {category.description}
                                </p>

                                {/* 도구 목록 */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
                                    {category.tools.map((tool, toolIdx) => (
                                        <a
                                            key={toolIdx}
                                            href={tool.link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className={[
                                                "group relative overflow-hidden",
                                                "rounded-xl p-5",
                                                "border",
                                                "bg-linear-to-br",
                                                "backdrop-blur-sm",
                                                "transition-all duration-300",
                                                "hover:shadow-xl hover:shadow-primary/10",
                                                "hover:-translate-y-1",
                                                "cursor-pointer",
                                                category.tone,
                                                category.border,
                                            ].join(" ")}
                                        >
                                            {/* 배경 글로우 효과 */}
                                            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                                                <div className={`absolute -top-20 -right-20 w-60 h-60 ${category.glowColor} rounded-full blur-3xl`} />
                                            </div>

                                            {/* 내용 */}
                                            <div className="relative flex items-start gap-4">
                                                {/* 아이콘 */}
                                                <div className="shrink-0 w-12 h-12 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center transition-transform group-hover:scale-110 group-hover:rotate-3">
                                                    <tool.icon className="w-6 h-6 text-white/80" />
                                                </div>

                                                {/* 텍스트 */}
                                                <div className="flex-1 space-y-1.5">
                                                    <h3 className="text-sm md:text-base font-bold text-white/90 group-hover:text-primary transition-colors">
                                                        {tool.name}
                                                    </h3>
                                                    <p className="text-xs md:text-sm text-white/60 leading-relaxed">
                                                        {tool.description}
                                                    </p>

                                                    {/* 링크 표시 */}
                                                    <div className="flex items-center gap-1 text-[10px] md:text-xs text-primary/70 group-hover:text-primary transition-colors">
                                                        <span>자세히 보기</span>
                                                        <svg className="w-3 h-3 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                        </svg>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* 하단 액센트 */}
                                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-linear-to-r from-transparent via-primary/0 to-transparent group-hover:via-primary/50 transition-all duration-300" />
                                        </a>
                                    ))}
                                </div>
                            </article>
                        ))}
                    </div>

                    {/* 추가 정보 */}
                    <div className="mt-8 md:mt-12 p-5 md:p-6 rounded-2xl bg-linear-to-br from-primary/5 to-primary/2 border border-primary/20">
                        <h3 className="text-base md:text-lg font-bold text-white/90 mb-3 flex items-center gap-2">
                            <span>💡</span>
                            참고
                        </h3>
                        <p className="text-xs md:text-sm text-white/70 leading-relaxed">
                            이 목록은 현재 활발히 사용 중인 도구들입니다. 프로젝트와 상황에 따라 다른 도구들도 유연하게 사용합니다.
                        </p>
                    </div>
                </section>
            </Contents>
        </>
    );
};
