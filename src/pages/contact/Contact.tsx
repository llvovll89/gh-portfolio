import {Aside} from "../../components/aside/Aside";
import {Contents} from "../../components/contents/Contents";
import {Header} from "../../components/header/Header";
import {CommunicationCard} from "./contents/CommnuiCationCard";
import {MessageCardForm} from "./contents/MessageCardForm";
import {HiMailOpen} from "react-icons/hi";

export const Contact = () => {
    return (
        <>
            <Header />
            <Aside />
            <Contents className="select-none">
                <section className="relative w-full max-w-6xl mx-auto overflow-scroll scrolls px-4 md:px-6">
                    {/* 헤더 텍스트 */}
                    <div className="relative mb-8 md:mb-10">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 bg-primary/10 rounded-lg">
                                <HiMailOpen className="w-6 h-6 text-primary" />
                            </div>
                            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
                                Contact
                            </h1>
                        </div>
                        <p className="text-sm md:text-base text-white/70 max-w-2xl leading-relaxed">
                            채용/협업/사이드 프로젝트 문의 모두 환영합니다. 가장 빠른 채널은 이메일입니다.
                        </p>
                    </div>

                    <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-5 lg:gap-6 items-start pb-8">
                        {/* 왼쪽: 연락 카드 */}
                        <CommunicationCard />

                        {/* 오른쪽: 폼 */}
                        <MessageCardForm />
                    </div>
                </section>
            </Contents>
        </>
    );
};
