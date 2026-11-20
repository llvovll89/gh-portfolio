import { uiText } from "../../utils/uiText";
import { Aside } from "../../components/aside/Aside";
import { Contents } from "../../components/contents/Contents";
import { Header } from "../../components/header/Header";
import { CommunicationCard } from "./contents/CommunicationCard";
import { MessageCardForm } from "./contents/MessageCardForm";
import { PageHeader } from "../../components/pageHeader/PageHeader";
import { useTranslation } from "react-i18next";
import { useSeoMeta } from "../../hooks/useSeoMeta";

export const Contact = () => {
    const { t } = useTranslation();
    useSeoMeta({ title: "Contact", description: uiText("김건호에게 메시지를 보내세요. 이메일 또는 폼으로 연락할 수 있습니다."), url: "/contact" });

    return (
        <>
            <Header />
            <Aside />
            <Contents>
                <section className="contact-page relative w-full max-w-6xl mx-auto overflow-auto scrolls px-2 md:px-6">
                    <PageHeader title={t("pages.contact.title")} description={t("pages.contact.subtitle")} />

                    <div className="contact-layout">
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
