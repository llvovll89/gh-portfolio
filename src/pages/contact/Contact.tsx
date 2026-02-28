import { Aside } from "../../components/aside/Aside";
import { Contents } from "../../components/contents/Contents";
import { Header } from "../../components/header/Header";
import { CommunicationCard } from "./contents/CommnuiCationCard";
import { MessageCardForm } from "./contents/MessageCardForm";
import { HiMailOpen } from "react-icons/hi";
import { useTranslation } from "react-i18next";

export const Contact = () => {
    const { t } = useTranslation();

    return (
        <>
            <Header />
            <Aside />
            <Contents className="select-none">
                <section className="relative w-full max-w-6xl mx-auto overflow-auto scrolls px-2 md:px-6">
                    <div className="relative mb-6 sm:mb-10">
                        <div className="flex items-center gap-3 sm:mb-3 mb-1.5">
                            <div className="p-2 bg-primary/10 rounded-lg">
                                <HiMailOpen className="w-6 h-6 text-primary" />
                            </div>
                            <h1 className="text-[clamp(1.5rem,3vw,2.25rem)] font-extrabold tracking-tight">
                                {t("pages.contact.title")}
                            </h1>
                        </div>
                        <p className="text-[clamp(0.78rem,1vw,0.875rem)] md:text-base text-white/70 max-w-2xl leading-relaxed">
                            {t("pages.contact.subtitle")}
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
