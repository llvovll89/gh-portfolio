import {Aside} from "../../components/aside/Aside";
import {Contents} from "../../components/contents/Contents";
import {Header} from "../../components/header/Header";
import {CommonPageHeader} from "../common/innerHeader/CommonPageHeader";
import {Skills} from "./contents/Skills";
import {Education} from "./contents/Education";
import {PersonalHistory} from "./contents/PersonalHistory";

export const Profile = () => {
    return (
        <>
            <Header />
            <Aside />
            <Contents className="select-none">
                <CommonPageHeader />
                <section className="w-full h-full md:pt-8 md:pb-8 pt-4 pb-6 md:px-4 px-1 flex md:flex-row flex-col gap-6 overflow-auto scrolls">
                    {/* 왼쪽: 프로필 카드 */}
                    <section className="md:w-[40%] w-full h-full flex gap-4 items-start justify-center">
                        <div className="w-full h-full relative flex flex-col items-center gap-5">
                            {/* 타이틀 */}
                            <div className="flex items-center gap-3">
                                <h2 className="font-bold text-[clamp(1.5rem,2vw,2.5rem)] text-white/90">
                                    Profile
                                </h2>
                                <div className="grid grid-cols-2 gap-0.5">
                                    <span className="w-3 h-3 rounded-full bg-primary border-2 border-white/50 animate-pulse" />
                                    <span className="w-3 h-3 rounded-full bg-primary/70 border-2 border-white/50" />
                                    <span className="w-3 h-3 rounded-full bg-primary/50 border-2 border-white/50" />
                                    <span className="w-3 h-3 rounded-full bg-primary/30 border-2 border-white/50" />
                                </div>
                            </div>

                            {/* 프로필 이미지 카드 */}
                            <figure className="w-[min(320px,85%)] md:w-72 group">
                                <div className="relative p-1 rounded-3xl bg-linear-to-br from-primary/30 via-primary/10 to-transparent shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
                                    <div className="relative rounded-3xl overflow-hidden bg-black/30 border border-white/10 shadow-inner">
                                        <div className="aspect-4/5 w-full">
                                            <img
                                                src="/assets/images/kimgeonho/증명사진.png"
                                                alt="김건호 프로필 사진"
                                                loading="lazy"
                                                decoding="async"
                                                className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                                            />
                                        </div>

                                        {/* 그라디언트 오버레이 */}
                                        <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/60 via-black/0 to-white/5" />

                                        {/* 배지 */}
                                        <figcaption className="absolute left-4 bottom-4">
                                            <span className="px-4 py-2 rounded-xl text-xs md:text-sm font-bold text-white bg-linear-to-r from-primary to-blue-500 border border-white/20 backdrop-blur shadow-lg">
                                                FullStack Developer
                                            </span>
                                        </figcaption>

                                        {/* 호버 시 빛나는 효과 */}
                                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                                            <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-60 h-60 bg-primary/20 rounded-full blur-3xl" />
                                        </div>
                                    </div>
                                </div>
                            </figure>

                            {/* 구분선 */}
                            <div className="w-2/3 h-px bg-linear-to-r from-transparent via-white/30 to-transparent" />

                            {/* 기본 정보 */}
                            <div className="flex flex-col w-full items-center gap-4">
                                <div className="text-center space-y-2">
                                    <h3 className="font-bold text-xl md:text-2xl text-white/95">
                                        김건호 <span className="text-white/70 text-base md:text-lg">Kim Geon Ho</span>
                                    </h3>

                                    <div className="flex flex-col gap-1.5 text-sm md:text-base text-white/70">
                                        <div className="flex items-center justify-center gap-2">
                                            <svg className="w-4 h-4 text-primary/80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                            <span>1994.05.04</span>
                                        </div>
                                        <div className="flex items-center justify-center gap-2">
                                            <svg className="w-4 h-4 text-primary/80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                            </svg>
                                            <span>svvvs5579@naver.com</span>
                                        </div>
                                    </div>
                                </div>

                                {/* 구분선 */}
                                <div className="w-2/3 h-px bg-linear-to-r from-transparent via-white/30 to-transparent" />

                                {/* 소개 문구 */}
                                <blockquote className="relative">
                                    <div className="absolute -left-2 -top-2 text-primary/30 text-3xl">"</div>
                                    <p className="text-sm md:text-base text-white/80 italic px-4 py-2 text-center leading-relaxed">
                                        호기심이 가득한 웹 개발자<br />
                                        김건호 입니다.
                                    </p>
                                    <div className="absolute -right-2 -bottom-2 text-primary/30 text-3xl">"</div>
                                </blockquote>

                                {/* 소셜 링크 또는 추가 정보를 넣을 수 있는 영역 */}
                                <div className="flex gap-3 mt-2">
                                    <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 hover:border-primary/30 transition-all cursor-pointer">
                                        <svg className="w-5 h-5 text-white/70" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* 오른쪽: 상세 정보 */}
                    <section className="md:w-[60%] w-full h-full flex flex-col gap-6">
                        <Skills />
                        <Education />
                        <PersonalHistory />
                    </section>
                </section>
            </Contents>
        </>
    );
};
