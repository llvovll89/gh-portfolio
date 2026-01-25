import { CONTACT, PROJECTS } from "../../../../routes/route";
import { useHandlePushPath } from "../../../../hooks/useHandlePushPath";
import { useCheckedMobileSize } from "../../../../hooks/useCheckedMobileSize";

export const MainContents = () => {
    const handlePushPath = useHandlePushPath();
    const isMobileSize = useCheckedMobileSize();

    const baseButton =
        "inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-[clamp(0.9rem,1.1vw,1.05rem)] font-semibold transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent";
    const primaryButton =
        `${baseButton} bg-primary text-white shadow-lg shadow-primary/20 hover:brightness-110 hover:-translate-y-0.5 active:translate-y-0`;
    const secondaryButton =
        `${baseButton} border border-white/15 bg-white/5 text-white hover:bg-white/10 hover:-translate-y-0.5 active:translate-y-0`;

    const floatingTags = [
        { text: "<Developer />", top: "15%", left: "58%", tone: "strong", anim: "animate-[bounce_2.5s_infinite]" },
        { text: "<Visual Studio Code />", top: "82%", left: "52%", tone: "soft", anim: "animate-[bounce_3s_infinite]" },
        { text: "<Focusing on UX />", top: "66%", left: "46%", tone: "soft", anim: "animate-[bounce_3.4s_infinite]" },
        { text: "<Code Quality />", top: "38%", left: "38%", tone: "soft", anim: "animate-[bounce_3.2s_infinite]" },
        { text: "<Communication />", top: "48%", left: "68%", tone: "soft", anim: "animate-[bounce_3.6s_infinite]" },
    ] as const;

    const tagBase =
        "absolute -translate-x-1/2 -translate-y-1/2 w-max" +
        "px-3 py-2 rounded-2xl shadow-2xl border backdrop-blur-sm " +
        "text-[10px] font-mono whitespace-nowrap select-none";

    const tagStrong =
        "bg-white/10 border-white/20 text-white/80 tracking-tighter";
    const tagSoft =
        "bg-white/5 border-white/10 text-white/60 italic";

    return (
        <article className="relative z-10 w-full h-full lg:p-8 md:p-4 p-1">
            <div
                aria-hidden="true"
                className="pointer-events-none absolute -top-10 -left-10 h-56 w-56 rounded-full bg-linear-to-r from-primary/25 via-sky-300/25 to-violet-300/25 blur-3xl"
            />
            <div
                aria-hidden="true"
                className="pointer-events-none absolute -bottom-10 -right-10 h-64 w-64 rounded-full bg-linear-to-l from-primary/25 via-sky-300/25 to-violet-300/25 blur-3xl"
            />

            <div className="relative flex flex-col lg:flex-row items-stretch gap-10 lg:gap-14 h-full">
                <section className={`flex-1 rounded-2xl bg-white/0 ${isMobileSize ? "backdrop-blur-[1.5px]" : ""}`}>
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/80">
                            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                            Frontend Developer
                        </span>

                        <span className="text-xs text-white/60">
                            Building clean UI · Writing about dev
                        </span>
                    </div>

                    <div className="mt-6 flex flex-col gap-3 leading-none">
                        <h1 className="text-[clamp(2rem,3.6vw,4.2rem)] font-extrabold tracking-tight text-white flex flex-col">
                            Hi, I’m
                            <span className="bg-linear-to-r from-primary via-sky-300 to-violet-300 bg-clip-text text-transparent">
                                Geonho Kim.
                            </span>
                        </h1>
                        <p className="text-[clamp(0.8rem,1.3vw,1.2rem)] text-white/70 leading-relaxed max-w-2xl">
                            사용자가 “편하게” 느끼는 경험을 목표로, 빠르고 일관된 UI를 만들고
                            유지보수 가능한 프론트엔드를 지향합니다.
                        </p>
                    </div>

                    <div className="mt-6 grid text-[clamp(0.75rem,1.05vw,1.1rem)] text-white/75 leading-relaxed max-w-2xl">
                        <p>저의 웹 사이트에 오신 것을 환영합니다.</p>
                        <p>이곳은 제가 개발한 프로젝트와 기술 블로그를 공유하는 공간입니다.</p>
                        <p>다양한 기술 스택과 개발 경험을 바탕으로 유용한 정보를 제공하고자 합니다.</p>
                        <p className="text-white/85">
                            편안하게 둘러보시고 궁금한 점이 있으면 언제든지 연락 주세요!
                        </p>
                    </div>

                    <div className="mt-6 flex flex-wrap gap-2">
                        {["React", "TypeScript", "UI/UX", "Performance"].map((t) => (
                            <span
                                key={t}
                                className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70"
                            >
                                {t}
                            </span>
                        ))}
                    </div>

                    <div className="mt-8 flex flex-wrap gap-3">
                        <button
                            onClick={() => handlePushPath(PROJECTS)}
                            className={primaryButton}
                            aria-label="Go to Projects"
                        >
                            Projects <span aria-hidden="true">→</span>
                        </button>
                        <button
                            onClick={() => handlePushPath(CONTACT)}
                            className={secondaryButton}
                            aria-label="Go to Contact"
                        >
                            Contact
                        </button>
                    </div>
                </section>

                <aside className={`flex-1 flex items-center justify-center min-h-100 lg:min-h-150 ${isMobileSize ? "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 -z-1 w-full" : "relative"}`}>
                    <span className="opacity-flash absolute -top-10 right-0 text-[clamp(2rem,8vw,12.5rem)] font-black italic pointer-events-none select-none">
                        KIM
                    </span>

                    <div className="relative w-full max-w-125 aspect-square flex items-center justify-center">
                        <div className="absolute inset-0 animate-[spin_10s_linear_infinite] opacity-20">
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-primary shadow-[0_0_15px_rgba(var(--primary),0.8)]" />
                            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-violet-400" />
                            <div className="absolute top-1/2 left-0 -translate-y-1/2 w-1 h-1 rounded-full bg-sky-300" />
                        </div>

                        <div className="absolute w-[70%] h-[70%] bg-primary/20 rounded-full blur-[80px] animate-pulse" />
                        <div className="absolute w-[50%] h-[50%] bg-violet-500/10 rounded-full blur-[60px] delay-700" />

                        <div className="relative z-10 group cursor-pointer w-full h-full">
                            <div className="absolute -inset-4 bg-linear-to-tr from-primary/20 to-violet-500/20 rounded-4xl blur-xl opacity-0 transition-opacity duration-500" />

                            {floatingTags.map((t) => (
                                <div
                                    key={t.text}
                                    style={{ top: t.top, left: t.left }}
                                    className={[
                                        tagBase,
                                        t.tone === "strong" ? tagStrong : tagSoft,
                                        t.anim,
                                    ].join(" ")}
                                >
                                    {t.text}
                                </div>
                            ))}
                        </div>
                    </div>

                    <span className="opacity-flash absolute -bottom-10 right-0 text-[clamp(2rem,8vw,12.5rem)] font-black italic pointer-events-none select-none">
                        GEON HO
                    </span>
                </aside>
            </div>
        </article>
    );
};