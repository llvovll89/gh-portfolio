import {Aside} from "../../components/aside/Aside";
import {Contents} from "../../components/contents/Contents";
import {Header} from "../../components/header/Header";
import {CommunicationCard} from "./contents/CommnuiCationCard";
import {MessageCardForm} from "./contents/MessageCardForm";

export const Contact = () => {
    return (
        <>
            <Header />
            <Aside />
            <Contents className="select-none">
                <section className="relative w-full max-w-6xl mx-auto overflow-scroll scrolls">
                    {/* 헤더 텍스트 */}
                    <div className="relative mb-5">
                        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
                            Contact
                        </h1>
                        <p className="mt-2 text-sm md:text-base text-white/70 max-w-2xl">
                            채용/협업/사이드 프로젝트 문의 모두 환영합니다. 가장
                            빠른 채널은 이메일입니다.
                        </p>
                    </div>

                    <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 items-start">
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
