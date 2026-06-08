import { Aside } from "../../components/aside/Aside";
import { Contents } from "../../components/contents/Contents";
import { Header } from "../../components/header/Header";
import { Skills } from "./contents/Skills";
import { Education } from "./contents/Education";
import { PersonalHistory } from "./contents/PersonalHistory";
import { useSeoMeta } from "../../hooks/useSeoMeta";

export const Profile = () => {
    useSeoMeta({
        title: "Profile",
        description: "풀스택 웹 개발자 김건호의 프로필 — 기술 스택, 학력, 경력 소개",
        url: "/profile",
    });

    return (
        <>
            <Header />
            <Aside />
            <Contents className="select-none">
                <section className="w-full h-full overflow-auto scrolls">
                    {/* Hero 섹션 */}
                    <div className="relative flex flex-col items-center justify-center min-h-[340px] md:min-h-[420px] px-4 pt-10 pb-8 overflow-hidden">
                        {/* 배경 그라디언트 */}
                        <div className="pointer-events-none absolute inset-0 bg-linear-to-b from-primary/8 via-transparent to-transparent" />
                        <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary/10 rounded-full blur-3xl" />

                        {/* 프로필 이미지 */}
                        <figure className="relative mb-6 group animate-fade-in-up">
                            <div className="relative p-1 rounded-full bg-linear-to-br from-primary/60 via-primary/20 to-transparent shadow-[0_0_40px_rgba(0,153,255,0.25)]">
                                <div className="w-28 h-28 md:w-36 md:h-36 rounded-full overflow-hidden border border-white/10 bg-black/30">
                                    <img
                                        src="/assets/images/kimgeonho/증명사진.png"
                                        alt="김건호 프로필 사진"
                                        loading="eager"
                                        decoding="async"
                                        className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-110"
                                    />
                                </div>
                            </div>
                            {/* 온라인 배지 */}
                            <span className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-emerald-400 border-2 border-[#0c0b10] shadow" />
                        </figure>

                        {/* 이름 & 직함 */}
                        <div className="text-center space-y-2 animate-fade-in-up animate-delay-100">
                            <h1 className="font-bold text-[clamp(1.6rem,3vw,2.4rem)] text-white/95 tracking-tight">
                                김건호 <span className="text-white/50 font-normal text-[0.65em]">Kim Geon Ho</span>
                            </h1>
                            <p className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold text-white bg-linear-to-r from-primary to-blue-500 border border-white/20 backdrop-blur shadow-lg shadow-primary/20">
                                FullStack Developer
                            </p>
                        </div>

                        {/* 한 줄 소개 */}
                        <blockquote className="mt-4 max-w-xs text-center animate-fade-in-up animate-delay-200">
                            <p className="text-sm md:text-base text-white/60 italic leading-relaxed">
                                "호기심이 가득한 웹 개발자입니다."
                            </p>
                        </blockquote>

                        {/* 연락처 & 소셜 */}
                        <div className="mt-5 flex flex-wrap items-center justify-center gap-3 animate-fade-in-up animate-delay-300">
                            <a
                                href="https://github.com/llvovll89"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-white/70 bg-white/5 border border-white/10 hover:bg-white/10 hover:border-primary/30 hover:text-white hover:scale-110 transition-all"
                            >
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                                </svg>
                                GitHub
                            </a>
                            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-white/70 bg-white/5 border border-white/10">
                                <svg className="w-4 h-4 text-primary/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                svvvs5579@naver.com
                            </span>
                            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-white/70 bg-white/5 border border-white/10">
                                <svg className="w-4 h-4 text-primary/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                1994.05.04
                            </span>
                        </div>
                    </div>

                    {/* 구분선 */}
                    <div className="mx-4 md:mx-8 h-px bg-linear-to-r from-transparent via-white/15 to-transparent" />

                    {/* Skills / Education / History */}
                    <div className="md:pt-8 md:pb-8 pt-6 pb-6 md:px-6 px-2 flex md:flex-row flex-col gap-6">
                        <section className="md:w-[60%] w-full flex flex-col gap-6">
                            <div className="animate-[fadeIn_0.5s_ease-out_both]" style={{ animationDelay: '0.1s' }}>
                                <Skills />
                            </div>
                            <div className="animate-[fadeIn_0.5s_ease-out_both]" style={{ animationDelay: '0.25s' }}>
                                <Education />
                            </div>
                        </section>
                        <section className="md:w-[40%] w-full">
                            <div className="animate-[fadeIn_0.5s_ease-out_both]" style={{ animationDelay: '0.4s' }}>
                                <PersonalHistory />
                            </div>
                        </section>
                    </div>
                </section>
            </Contents>
        </>
    );
};
