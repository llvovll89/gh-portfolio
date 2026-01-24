import { CONTACT, PROJECTS } from "../../../../routes/route";
import { useHandlePushPath } from "../../../../hooks/useHandlePushPath";
import { Img } from "../../../../components/Img";
import { useContext } from "react";
import { GlobalStateContext } from "../../../../context/GlobalState.context";
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
                <section className="flex-1 rounded-2xl bg-white/0">
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

                <aside className={`flex-1 relative flex items-center justify-center min-h-100 lg:min-h-150 ${isMobileSize ? " hidden" : ""}`}>
                    <div className="relative w-full max-w-125 aspect-square flex items-center justify-center">

                        <div className="absolute inset-0 animate-[spin_10s_linear_infinite] opacity-20">
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-primary shadow-[0_0_15px_rgba(var(--primary),0.8)]" />
                            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-violet-400" />
                            <div className="absolute top-1/2 left-0 -translate-y-1/2 w-1 h-1 rounded-full bg-sky-300" />
                        </div>

                        {/* 2. 여러 겹의 Glow 효과 (입체감) */}
                        <div className="absolute w-[70%] h-[70%] bg-primary/20 rounded-full blur-[80px] animate-pulse" />
                        <div className="absolute w-[50%] h-[50%] bg-violet-500/10 rounded-full blur-[60px] delay-700" />

                        {/* 3. 로고 본체: 그림자와 반사광 효과 */}
                        <div className="relative z-10 group cursor-pointer">
                            <div className="absolute -inset-4 bg-linear-to-tr from-primary/20 to-violet-500/20 rounded-4xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                            <Img
                                src="/assets/logo/GH_logo_small_white.png"
                                className="w-72 lg:w-96 drop-shadow-[0_20px_50px_rgba(0,0,0,0.3)] group-hover:scale-105 group-hover:-rotate-2 transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
                            />

                            {/* 로고 위에 떠다니는 작은 플로팅 요소들 (장식) */}
                            <div className="absolute -top-4 -right-4 bg-white/10 backdrop-blur-md border border-white/20 p-3 rounded-2xl shadow-2xl animate-bounce tracking-tighter text-[10px] text-white/80 font-mono">
                                {"<Developer />"}
                            </div>
                            <div className="absolute -bottom-8 -left-8 bg-white/5 backdrop-blur-sm border border-white/10 p-3 rounded-2xl shadow-2xl animate-[bounce_3s_infinite] text-[10px] text-white/60 font-mono italic">
                                Focusing on UX
                            </div>
                        </div>

                        {/* 4. 장식용 배경 텍스트 (큼지막한 타이포그래피) */}
                        <span className="absolute -bottom-10 right-0 text-[160px] font-black text-white/2 italic pointer-events-none select-none">
                            GEO
                        </span>
                    </div>
                </aside>
            </div>
        </article>
    );
};