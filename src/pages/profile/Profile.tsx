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
                <section className="w-full h-full md:pt-8 md:pb-8 pt-4 pb-6 md:px-4 px-1 flex md:flex-row flex-col gap-4 overflow-auto scrolls">
                    <section className="md:w-[40%] w-full h-full flex gap-4 items-center justify-center">
                        <div className="w-full h-full relative flex flex-col items-center gap-4">
                            <h2 className="font-bold text-[clamp(1.5rem,2vw,2.5rem)] flex items-center gap-2">
                                Profile
                                <div className="grid grid-cols-2">
                                    <span className="w-4 h-4 rounded-full bg-primary border-2 border-white/50"></span>
                                    <span className="w-4 h-4 rounded-full bg-primary border-2 border-white/50"></span>
                                    <span className="w-4 h-4 rounded-full bg-primary border-2 border-white/50"></span>
                                    <span className="w-4 h-4 rounded-full bg-primary border-2 border-white/50"></span>
                                </div>
                                {/* <Img
                                    src="/assets/logo/GH_logo_small_white.png"
                                    className={`${convertThemeLogoColor(
                                        selectedTheme.mode,
                                    )} w-6 border-white/30 rounded-full`}
                                /> */}
                            </h2>

                            <figure className="w-[min(300px,78%)] md:w-60">
                                <div className="p-0.5 rounded-2xl shadow-[0_18px_55px_rgba(0,0,0,0.45)]">
                                    <div className="relative rounded-2xl overflow-hidden bg-black/25 border border-white/10">
                                        <div className="aspect-4/5 w-full">
                                            <img
                                                src="/assets/images/kimgeonho/증명사진.png"
                                                alt="김건호 프로필 사진"
                                                loading="lazy"
                                                decoding="async"
                                                className="w-full h-full object-cover object-center transition-transform duration-500 hover:scale-[1.03]"
                                            />
                                        </div>

                                        {/* subtle overlay */}
                                        <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/45 via-black/0 to-white/5" />

                                        {/* badge */}
                                        <figcaption className="absolute left-3 bottom-3">
                                            <span className="px-2.5 py-1 rounded-xl text-[11px] md:text-xs font-bold text-white bg-black/35 border border-white/15 backdrop-blur">
                                                FullStack
                                            </span>
                                        </figcaption>
                                    </div>
                                </div>
                            </figure>

                            <hr className="w-1/2 h-px bg-white/20 mx-auto" />

                            <ul className="flex flex-col w-full h-full items-center text-[clamp(0.8rem,4vw,1rem)]">
                                <li className="font-bold text-[20px]">
                                    김건호 / Kim Geon Ho
                                </li>
                                <li>1994.05.04</li>
                                <li>svvvs5579@naver.com</li>
                            </ul>

                            <hr className="w-1/2 h-px bg-white/20 mx-auto" />

                            <span>
                                "호기심이 가득한 웹 개발자 김건호 입니다."
                            </span>
                        </div>
                    </section>

                    <section className="md:w-[60%] w-full h-full flex flex-col gap-4">
                        {/* <Title /> */}
                        {/* <Description /> */}
                        <Skills />
                        <Education />
                        <PersonalHistory />
                    </section>
                </section>
            </Contents>
        </>
    );
};
