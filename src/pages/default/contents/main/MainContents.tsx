import { CONTACT, PROJECTS } from "../../../../routes/route";
import { useHandlePushPath } from "../../../../hooks/useHandlePushPath";
import { useCheckedMobileSize } from "../../../../hooks/useCheckedMobileSize";
import { useEffect, useState } from "react";

export const MainContents = () => {
    const handlePushPath = useHandlePushPath();
    const isMobileSize = useCheckedMobileSize();
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            setMousePosition({ x: e.clientX, y: e.clientY });
        };
        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, []);

    const baseButton =
        "group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-2xl px-6 py-3.5 text-sm md:text-base font-bold transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:ring-offset-2";

    const primaryButton =
        `${baseButton} bg-linear-to-r from-primary via-blue-500 to-cyan-400 text-white shadow-2xl shadow-primary/30 hover:shadow-primary/50 hover:scale-105 active:scale-95`;

    const secondaryButton =
        `${baseButton} border-2 border-white/20 bg-white/5 text-white backdrop-blur-sm hover:bg-white/10 hover:border-white/30 hover:scale-105 active:scale-95`;

    const skills = [
        { text: "React", icon: "⚛️", delay: "0s" },
        { text: "TypeScript", icon: "📘", delay: "0.2s" },
        { text: "UI/UX", icon: "🎨", delay: "0.4s" },
        { text: "Performance", icon: "⚡", delay: "0.6s" },
    ];

    return (
        <article className="relative z-10 w-full h-full lg:p-8 md:p-6 p-4">
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
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[...Array(20)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute w-1 h-1 bg-white/30 rounded-full animate-pulse"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 3}s`,
                            animationDuration: `${2 + Math.random() * 3}s`,
                        }}
                    />
                ))}
            </div>

            <div className="relative flex flex-col lg:flex-row items-center gap-12 lg:gap-16 h-full">
                <section className="w-full flex-1 space-y-8 animate-[fadeIn_0.8s_ease-out]">
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
                                Frontend Developer
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

                        <p className="text-[clamp(1rem,1.4vw,1.3rem)] text-white/80 leading-relaxed max-w-2xl font-medium animate-[fadeIn_1s_ease-out_0.3s] opacity-0 [animation-fill-mode:forwards]">
                            사용자가 <span className="text-primary font-bold">"편하게"</span> 느끼는 경험을 목표로,
                            <br />
                            빠르고 일관된 UI를 만들고 유지보수 가능한 프론트엔드를 지향합니다.
                        </p>
                    </div>

                    <div className="space-y-2 text-[clamp(0.9rem,1.1vw,1.05rem)] text-white/70 leading-relaxed max-w-xl animate-[fadeIn_1.2s_ease-out_0.5s] opacity-0 [animation-fill-mode:forwards]">
                        <p className="flex items-start gap-2">
                            <span className="text-primary mt-1">▹</span>
                            <span>저의 웹 사이트에 오신 것을 환영합니다.</span>
                        </p>
                        <p className="flex items-start gap-2">
                            <span className="text-primary mt-1">▹</span>
                            <span>이곳은 제가 개발한 프로젝트와 기술 블로그를 공유하는 공간입니다.</span>
                        </p>
                        <p className="flex items-start gap-2">
                            <span className="text-primary mt-1">▹</span>
                            <span>다양한 기술 스택과 개발 경험을 바탕으로 유용한 정보를 제공하고자 합니다.</span>
                        </p>
                        <p className="flex items-start gap-2 text-white/85 font-medium">
                            <span className="text-cyan-400 mt-1">✦</span>
                            <span>편안하게 둘러보시고 궁금한 점이 있으면 언제든지 연락 주세요!</span>
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-3 animate-[fadeIn_1.4s_ease-out_0.7s] opacity-0 [animation-fill-mode:forwards]">
                        {skills.map((skill) => (
                            <div
                                key={skill.text}
                                style={{ animationDelay: skill.delay }}
                                className="group relative overflow-hidden rounded-xl border border-white/15 bg-white/5 backdrop-blur-sm px-4 py-2 text-sm font-semibold text-white/80 transition-all duration-300 hover:bg-white/10 hover:border-primary/50 hover:scale-110 hover:text-white cursor-default"
                            >
                                <div className="absolute inset-0 bg-linear-to-r from-primary/0 via-primary/10 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity" />
                                <span className="relative flex items-center gap-2">
                                    <span className="text-base">{skill.icon}</span>
                                    {skill.text}
                                </span>
                            </div>
                        ))}
                    </div>

                    <div className="flex flex-wrap gap-4 pt-4 animate-[fadeIn_1.6s_ease-out_0.9s] opacity-0 [animation-fill-mode:forwards]">
                        <button
                            onClick={() => handlePushPath(PROJECTS)}
                            className={primaryButton}
                            aria-label="Go to Projects"
                        >
                            <span className="relative z-10 flex items-center gap-2">
                                View Projects
                                <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                            </span>
                            <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                        </button>

                        <button
                            onClick={() => handlePushPath(CONTACT)}
                            className={secondaryButton}
                            aria-label="Go to Contact"
                        >
                            <span className="relative z-10 flex items-center gap-2">
                                Get in Touch
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                            </span>
                        </button>
                    </div>
                </section>

                {/* 오른쪽: 3D 인터랙티브 영역 */}
                {!isMobileSize && (
                    <aside className="flex-1 flex items-center justify-center min-h-150 relative">
                        {/* 배경 텍스트 */}
                        <div className="absolute inset-0 flex flex-col items-end justify-between py-10 opacity-5 pointer-events-none select-none">
                            <span className="text-[clamp(3rem,10vw,14rem)] font-black italic tracking-tighter">
                                KIM
                            </span>
                            <span className="text-[clamp(3rem,10vw,14rem)] font-black italic tracking-tighter">
                                GEON HO
                            </span>
                        </div>

                        {/* 3D 카드 */}
                        <div className="relative w-full max-w-md aspect-square">
                            {/* 회전하는 링 */}
                            <div className="absolute inset-0 animate-[spin_20s_linear_infinite]">
                                <div className="absolute w-full h-full border-2 border-primary/20 rounded-full" />
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-primary shadow-[0_0_20px_rgba(0,153,255,0.8)]" />
                            </div>

                            <div className="absolute inset-8 animate-[spin_15s_linear_infinite_reverse]">
                                <div className="absolute w-full h-full border-2 border-cyan-400/20 rounded-full" />
                                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-3 h-3 rounded-full bg-cyan-400" />
                            </div>

                            {/* 중앙 글로우 */}
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-64 h-64 bg-primary/20 rounded-full blur-3xl animate-pulse" />
                                <div className="absolute w-48 h-48 bg-cyan-400/15 rounded-full blur-2xl animate-pulse" style={{ animationDelay: "1s" }} />
                                <div className="absolute w-32 h-32 bg-blue-500/20 rounded-full blur-xl animate-pulse" style={{ animationDelay: "2s" }} />
                            </div>

                            {/* 플로팅 코드 태그 */}
                            <div className="absolute inset-0">
                                {[
                                    { text: "<Developer />", x: "15%", y: "20%", delay: "0s" },
                                    { text: "<VSCode />", x: "75%", y: "30%", delay: "0.5s" },
                                    { text: "<UX Focus />", x: "60%", y: "70%", delay: "1s" },
                                    { text: "<Clean Code />", x: "20%", y: "65%", delay: "1.5s" },
                                    { text: "<Fast UI />", x: "80%", y: "80%", delay: "2s" },
                                ].map((tag, i) => (
                                    <div
                                        key={i}
                                        style={{
                                            left: tag.x,
                                            top: tag.y,
                                            animationDelay: tag.delay,
                                        }}
                                        className="absolute -translate-x-1/2 -translate-y-1/2 animate-[float_3s_ease-in-out_infinite]"
                                    >
                                        <div className="group relative cursor-default">
                                            <div className="absolute inset-0 bg-primary/20 blur-xl rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                                            <div className="relative px-4 py-2 rounded-xl border border-white/20 bg-white/10 backdrop-blur-md shadow-2xl text-xs font-mono text-white/90 whitespace-nowrap hover:bg-white/20 hover:border-primary/40 transition-all">
                                                {tag.text}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </aside>
                )}
            </div>
        </article>
    );
};