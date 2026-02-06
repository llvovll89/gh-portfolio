import { FaJava, FaReact } from "react-icons/fa";
import { RiTailwindCssFill } from "react-icons/ri";
import { SiPostgresql, SiRedux, SiSpring } from "react-icons/si";
import { TbBrandTypescript } from "react-icons/tb";

export const Skills = () => {
    const skillGroups = [
        {
            title: "FrontEnd",
            tone: "from-blue-500/15 via-cyan-400/10 to-sky-500/5",
            border: "border-blue-400/25",
            badge: "bg-linear-to-r from-blue-500 to-cyan-500 text-white",
            glowColor: "bg-blue-500/20",
            items: [
                { label: "React", Icon: FaReact },
                { label: "TypeScript", Icon: TbBrandTypescript },
                { label: "Redux", Icon: SiRedux },
                { label: "TailwindCSS", Icon: RiTailwindCssFill },
            ],
        },
        {
            title: "BackEnd",
            tone: "from-emerald-500/15 via-green-400/10 to-teal-500/5",
            border: "border-emerald-400/25",
            badge: "bg-linear-to-r from-emerald-500 to-teal-500 text-white",
            glowColor: "bg-emerald-500/20",
            items: [
                { label: "JAVA", Icon: FaJava },
                { label: "SpringBoot", Icon: SiSpring },
                { label: "PostgreSQL / Oracle", Icon: SiPostgresql },
            ],
        },
    ] as const;

    return (
        <article className="w-full flex flex-col gap-4 overflow-auto scrolls">
            <div className="flex items-center gap-3 md:gap-5">
                <div className="flex-1 md:flex-none md:w-20 h-px bg-linear-to-r from-transparent via-primary/50 to-primary" />
                <h1 className="text-[clamp(1.2rem,2.5vw,2rem)] shrink-0 whitespace-nowrap font-bold text-white/90 pr-2 flex items-center gap-2">
                    <span className="text-2xl">⚡</span>
                    Skills
                </h1>
            </div>

            {/* content */}
            <ul className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
                {skillGroups.map((group) => (
                    <li
                        key={group.title}
                        className={[
                            "group relative overflow-hidden",
                            "rounded-2xl p-5",
                            "border",
                            "bg-linear-to-br",
                            "backdrop-blur-sm",
                            "shadow-lg",
                            "transition-all duration-300",
                            "hover:shadow-xl hover:shadow-primary/10",
                            "hover:-translate-y-1",
                            group.tone,
                            group.border,
                        ].join(" ")}
                    >
                        {/* 배경 글로우 효과 */}
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                            <div className={`absolute -top-20 -right-20 w-60 h-60 ${group.glowColor} rounded-full blur-3xl`} />
                        </div>

                        {/* 헤더 */}
                        <div className="relative flex items-center justify-between gap-2 mb-4">
                            <span
                                className={[
                                    "inline-flex items-center",
                                    "px-4 py-2 rounded-lg",
                                    "text-sm md:text-base font-bold tracking-wide",
                                    "shadow-lg",
                                    "transition-transform duration-300",
                                    "group-hover:scale-105",
                                    group.badge,
                                ].join(" ")}
                            >
                                {group.title}
                            </span>

                            {/* 우상단 장식 */}
                            <div className="flex gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-white/40" />
                                <span className="w-1.5 h-1.5 rounded-full bg-white/30" />
                                <span className="w-1.5 h-1.5 rounded-full bg-white/20" />
                            </div>
                        </div>

                        {/* 스킬 목록 */}
                        <ul className="relative flex flex-wrap gap-2.5">
                            {group.items.map(({ label, Icon }) => (
                                <li
                                    key={label}
                                    className={[
                                        "group/item relative",
                                        "flex items-center gap-2",
                                        "px-3.5 py-2.5",
                                        "rounded-lg",
                                        "bg-white/5 hover:bg-white/10",
                                        "border border-white/10 hover:border-white/25",
                                        "backdrop-blur-sm",
                                        "text-white",
                                        "text-xs sm:text-sm font-medium",
                                        "leading-none",
                                        "select-none",
                                        "transition-all duration-200",
                                        "hover:shadow-lg hover:shadow-white/5",
                                        "hover:-translate-y-0.5",
                                        "cursor-default",
                                    ].join(" ")}
                                >
                                    <Icon className="w-4 h-4 sm:w-5 sm:h-5 shrink-0 transition-transform group-hover/item:scale-110" />
                                    <span className="whitespace-nowrap">{label}</span>

                                    {/* 호버 시 빛나는 효과 */}
                                    <div className="absolute inset-0 rounded-lg bg-linear-to-r from-white/0 via-white/5 to-white/0 opacity-0 group-hover/item:opacity-100 transition-opacity" />
                                </li>
                            ))}
                        </ul>

                        {/* 하단 장식 라인 */}
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-linear-to-r from-transparent via-white/0 to-transparent group-hover:via-white/20 transition-all duration-500" />
                    </li>
                ))}
            </ul>
        </article>
    );
};