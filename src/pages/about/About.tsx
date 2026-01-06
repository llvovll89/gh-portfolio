import {useContext, useState} from "react";
import {Aside} from "../../components/aside/Aside";
import {Contents} from "../../components/contents/Contents";
import {Bottom} from "../../components/footer/Footer";
import {Header} from "../../components/header/Header";
import {Img} from "../../components/Img";
import {CommonPageHeader} from "../common/innerHeader/CommonPageHeader";
import {Description} from "./contents/Description";
import {Skills} from "./contents/Skills";
import {Title} from "./contents/Title";
import {Education} from "./contents/Education";
import {PersonalHistory} from "./contents/PersonalHistory";
import {convertThemeLogoColor} from "../../utils/convertThemeTextColor";
import {GlobalStateContext} from "../../context/GlobalState.context";

export const About = () => {
    const {selectedTheme} = useContext(GlobalStateContext);

    return (
        <>
            <Header />
            <Aside />
            <Contents className="select-none">
                <CommonPageHeader />
                <section className="w-full h-full overflow-hidden pt-10 flex gap-4">
                    <section className="w-[40%] h-full flex gap-4 items-center justify-center">
                        <div className="w-full h-full relative flex flex-col items-center gap-4">
                            <img
                                src="/assets/images/kimgeonho/증명사진.png"
                                className="hover:scale-105 transition-all w-[52%] h-[60%] rounded-full object-cover shadow-lg border border-white/30"
                            />

                            <ul className="flex flex-col w-full h-full items-center">
                                <li className="font-bold text-[20px]">
                                    김건호 / Kim Geon Ho
                                </li>
                                <li>1994.05.04</li>
                                <li>svvvs5579@naver.com</li>
                                <Img
                                    src="/assets/logo/GH_logo_small_white.png"
                                    className={`${convertThemeLogoColor(
                                        selectedTheme.mode
                                    )} w-14 mt-5`}
                                />
                            </ul>
                        </div>
                    </section>

                    <section className="w-[60%]">
                        <Title />
                        <Description />
                        <Skills />
                        <Education />
                        <PersonalHistory />
                    </section>
                </section>
            </Contents>
            <Bottom />
        </>
    );
};
