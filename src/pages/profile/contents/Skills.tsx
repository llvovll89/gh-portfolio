import { FaJava, FaReact } from "react-icons/fa";
import { RiTailwindCssFill } from "react-icons/ri";
import { SiPostgresql, SiRedux, SiSpring } from "react-icons/si";
import { TbBrandTypescript } from "react-icons/tb";

export const Skills = () => {
    const skillGroups = [
        {
            title: "FrontEnd",
            tone: "from-yellow-400/20 to-amber-400/10",
            border: "border-yellow-300/30",
            badge: "bg-yellow-300/80 text-black",
            items: [
                { label: "React", Icon: FaReact },
                { label: "TypeScript", Icon: TbBrandTypescript },
                { label: "Redux", Icon: SiRedux },
                { label: "TailwindCSS", Icon: RiTailwindCssFill },
            ],
        },
        {
            title: "BackEnd",
            tone: "from-emerald-500/20 to-teal-400/10",
            border: "border-emerald-300/30",
            badge: "bg-emerald-500/80 text-black",
            items: [
                { label: "JAVA", Icon: FaJava },
                { label: "SpringBoot", Icon: SiSpring },
                { label: "PostgreSQL / Oracle", Icon: SiPostgresql },
            ],
        },
    ] as const;

    return (
        <article className="w-full flex flex-col gap-3 md:gap-4 overflow-auto scrolls">
            <div className="flex items-center md:gap-5 gap-2">
                <div className="flex-1 md:flex-none md:w-100 h-px bg-white/80" />
                <h1 className="text-[clamp(1.2rem,2.5vw,3rem)] shrink-0 whitespace-nowrap font-bold text-primary pr-2">
                    Skills
                </h1>
            </div>

            {/* content */}
            <ul className="w-full grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                {skillGroups.map((group) => (
                    <li
                        key={group.title}
                        className={[
                            "rounded-xl p-3 md:p-4",
                            "border",
                            "bg-linear-to-br",
                            "backdrop-blur-sm",
                            "shadow-sm",
                            group.tone,
                            group.border,
                        ].join(" ")}
                    >
                        <div className="flex items-center justify-between gap-2 mb-3">
                            <span
                                className={[
                                    "inline-flex items-center text-white",
                                    "px-2.5 py-1 rounded-md",
                                    "text-xs md:text-sm font-bold tracking-wide",
                                    group.badge,
                                ].join(" ")}
                            >
                                {group.title}
                            </span>

                            <span className="text-[11px] md:text-xs text-white/70">
                                Tap to scan
                            </span>
                        </div>

                        <ul className="flex flex-wrap gap-2">
                            {group.items.map(({ label, Icon }) => (
                                <li
                                    key={label}
                                    className={[
                                        "flex items-center gap-2",
                                        "px-3 py-2",
                                        "rounded-lg",
                                        "bg-black/20 hover:bg-black/30",
                                        "border border-white/10",
                                        "text-white",
                                        "text-xs sm:text-sm",
                                        "leading-none",
                                        "select-none",
                                    ].join(" ")}
                                >
                                    <Icon className="w-4 h-4 sm:w-4.5 sm:h-4.5 shrink-0" />
                                    <span className="whitespace-nowrap">{label}</span>
                                </li>
                            ))}
                        </ul>
                    </li>
                ))}
            </ul>
        </article>
    );
};