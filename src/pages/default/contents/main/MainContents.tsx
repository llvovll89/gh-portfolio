import {CONTACT, PROJECTS} from "../../../../routes/route";
import {useHandlePushPath} from "../../../../hooks/useHandlePushPath";
import {useCheckedMobileSize} from "../../../../hooks/useCheckedMobileSize";
import {useEffect, useMemo, useState} from "react";
import {useTranslation, Trans} from "react-i18next";
import { TerminalCard } from "../../../../components/terminalCard/TerminalCard";

const PARTICLES = Array.from({length: 20}, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    animationDelay: `${Math.random() * 3}s`,
    animationDuration: `${2 + Math.random() * 3}s`,
}));

export const MainContents = () => {
    const {t} = useTranslation();
    const handlePushPath = useHandlePushPath();
    const isMobileSize = useCheckedMobileSize();
    const [mousePosition, setMousePosition] = useState({x: 0, y: 0});
    const [prefersReducedMotion] = useState(
        () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches
    );

    const particles = useMemo(() => PARTICLES, []);

    useEffect(() => {
        if (prefersReducedMotion) return;
        const handleMouseMove = (e: MouseEvent) => {
            setMousePosition({x: e.clientX, y: e.clientY});
        };
        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, [prefersReducedMotion]);

    const baseButton =
        "group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-2xl sm:px-6 px-4 sm:py-3.5 py-2 text-sm md:text-base font-bold transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:ring-offset-2";

    const primaryButton = `${baseButton} bg-linear-to-r from-primary via-blue-500 to-cyan-400 text-white shadow-2xl shadow-primary/30 hover:shadow-primary/50 hover:scale-105 active:scale-95`;

    const secondaryButton = `${baseButton} border-2 border-white/20 bg-white/5 text-white backdrop-blur-sm hover:bg-white/10 hover:border-white/30 hover:scale-105 active:scale-95 [will-change:transform]`;

    const skills = [
        {text: "React", icon: "⚛️", delay: "0s"},
        {text: "TypeScript", icon: "📘", delay: "0.2s"},
        {text: "UI/UX", icon: "🎨", delay: "0.4s"},
        {text: "Performance", icon: "⚡", delay: "0.6s"},
    ];

    return (
        <article
            className={`relative z-10 w-full h-full sm:px-0 px-1 ${isMobileSize ? "overflow-y-auto overflow-x-hidden touch-pan-y" : "overflow-hidden"}`}
        >
            {/* 배경 그라디언트 효과 - 마우스 따라 움직임 */}
            <div
                aria-hidden="true"
                style={{
                    transform: `translate(${mousePosition.x * 0.02}px, ${mousePosition.y * 0.02}px)`,
                }}
                className="pointer-events-none absolute -top-20 -left-20 h-80 w-80 rounded-full bg-linear-to-br from-primary/30 via-cyan-400/20 to-blue-500/25 blur-3xl transition-transform duration-1000 ease-out"
            />
            <div
                aria-hidden="true"
                style={{
                    transform: `translate(${-mousePosition.x * 0.015}px, ${-mousePosition.y * 0.015}px)`,
                }}
                className="pointer-events-none absolute -bottom-20 -right-20 h-96 w-96 rounded-full bg-linear-to-tl from-violet-500/30 via-fuchsia-400/20 to-pink-500/25 blur-3xl transition-transform duration-1000 ease-out"
            />

            {/* 파티클 효과 */}
            {!prefersReducedMotion && (
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    {particles.map((particle) => (
                        <div
                            key={particle.id}
                            className="absolute w-1 h-1 bg-white/30 rounded-full animate-pulse"
                            style={{
                                left: particle.left,
                                top: particle.top,
                                animationDelay: particle.animationDelay,
                                animationDuration: particle.animationDuration,
                            }}
                        />
                    ))}
                </div>
            )}

            <div className="relative flex min-w-0 flex-col lg:flex-row items-center gap-12 lg:gap-16 h-full p-2">
                <section className="w-full min-w-0 flex-1 space-y-8 animate-[fadeIn_0.8s_ease-out] px-0.5">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="group flex items-center gap-3">
                            <div className="relative">
                                <div className="absolute inset-0 rounded-full bg-primary/50 blur-md animate-pulse" />
                                <span className="relative flex h-3 w-3">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-primary" />
                                </span>
                            </div>
                            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 backdrop-blur-md px-4 py-2 text-sm font-semibold text-white/90 shadow-lg">
                                {t("pages.home.badge")}
                            </span>
                        </div>

                        <div className="hidden md:flex items-center gap-2 text-xs text-white/60">
                            <div className="h-px w-8 bg-linear-to-r from-transparent to-white/30" />
                            <span>Clean UI · Dev Blog</span>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="space-y-3">
                            <h1 className="text-[clamp(1.8rem,4vw,4.5rem)] font-black tracking-tight leading-[1.1]">
                                <span className="block text-white/90 animate-[slideInLeft_0.6s_ease-out]">
                                    Hi, I'm
                                </span>
                                <span className="block bg-linear-to-r from-primary via-cyan-400 to-blue-500 bg-clip-text text-transparent animate-[slideInLeft_0.8s_ease-out] relative">
                                    Geonho Kim.
                                    <div className="absolute -bottom-2 left-0 h-1 w-32 bg-linear-to-r from-primary via-cyan-400 to-transparent rounded-full" />
                                </span>
                            </h1>
                        </div>

                        <p className="text-[clamp(0.9rem,1.4vw,1.3rem)] text-white/80 leading-relaxed max-w-2xl font-medium animate-[fadeIn_1s_ease-out] opacity-0 [animation-fill-mode:forwards]"
                            style={{ animationDelay: isMobileSize ? '0.1s' : '0.3s' }}>
                            <Trans
                                i18nKey="pages.home.tagline"
                                components={[
                                    <span className="text-primary font-bold" />,
                                ]}
                            />
                            <br />
                            {t("pages.home.taglineSub")}
                        </p>
                    </div>

                    <div className="text-[clamp(0.8rem,1.1vw,0.9rem)] text-white/70 leading-relaxed max-w-xl animate-[fadeIn_1.2s_ease-out] opacity-0 [animation-fill-mode:forwards]"
                        style={{ animationDelay: isMobileSize ? '0.15s' : '0.5s' }}>
                        <p className="flex items-start gap-2">
                            <span className="text-primary sm:mt-1 mt-0">▹</span>
                            <span>{t("pages.home.bullet1")}</span>
                        </p>
                        <p className="flex items-start gap-2">
                            <span className="text-primary sm:mt-1 mt-0">▹</span>
                            <span>{t("pages.home.bullet2")}</span>
                        </p>
                        <p className="flex items-start gap-2">
                            <span className="text-primary sm:mt-1 mt-0">▹</span>
                            <span>{t("pages.home.bullet3")}</span>
                        </p>
                        <p className="flex items-start gap-2 text-white/85 font-medium">
                            <span className="text-cyan-400 sm:mt-1 mt-0">
                                ✦
                            </span>
                            <span>{t("pages.home.cta")}</span>
                        </p>
                    </div>

                    <div className="flex flex-wrap sm:gap-3 gap-2 animate-[fadeIn_1.4s_ease-out] opacity-0 [animation-fill-mode:forwards]"
                        style={{ animationDelay: isMobileSize ? '0.2s' : '0.7s' }}>
                        {skills.map((skill) => (
                            <div
                                key={skill.text}
                                style={{animationDelay: skill.delay}}
                                className="group relative overflow-hidden rounded-xl border border-white/15 bg-white/5 backdrop-blur-sm px-4 py-2 text-[clamp(0.75rem,1.1vw,0.85rem)] font-semibold text-white/80 transition-all duration-300 hover:bg-white/10 hover:border-primary/50 hover:scale-110 hover:text-white cursor-default"
                            >
                                <div className="absolute inset-0 bg-linear-to-r from-primary/0 via-primary/10 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity" />
                                <span className="relative flex items-center gap-2">
                                    <span className="text-base">
                                        {skill.icon}
                                    </span>
                                    {skill.text}
                                </span>
                            </div>
                        ))}
                    </div>

                    <div className="flex flex-wrap sm:gap-4 gap-3 animate-[fadeIn_1.6s_ease-out] opacity-0 [animation-fill-mode:forwards]"
                        style={{ animationDelay: isMobileSize ? '0.25s' : '0.9s' }}>
                        <button
                            onClick={() => handlePushPath(PROJECTS)}
                            className={primaryButton}
                            aria-label="Go to Projects"
                        >
                            <span className="relative z-10 flex items-center gap-2 text-[clamp(0.8rem,1.1vw,0.9rem)]">
                                {t("pages.home.viewProjects")}
                                <svg
                                    className="w-5 h-5 transition-transform group-hover:translate-x-1"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2.5}
                                        d="M13 7l5 5m0 0l-5 5m5-5H6"
                                    />
                                </svg>
                            </span>
                            <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                        </button>

                        <button
                            onClick={() => handlePushPath(CONTACT)}
                            className={secondaryButton}
                            aria-label="Go to Contact"
                        >
                            <span className="relative z-10 flex items-center gap-2 text-[clamp(0.8rem,1.1vw,0.9rem)]">
                                {t("pages.home.getInTouch")}
                                <svg
                                    className="w-5 h-5"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                    />
                                </svg>
                            </span>
                        </button>
                    </div>
                </section>

                {/* 오른쪽: 터미널 카드 */}
                {!isMobileSize && (
                    <aside className="flex-1 flex items-center justify-center min-h-150 relative">
                        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                            <div className="w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
                        </div>
                        <div className="relative w-full max-w-md animate-[fadeIn_1s_ease-out]">
                            <TerminalCard />
                        </div>
                    </aside>
                )}
            </div>
        </article>
    );
};
