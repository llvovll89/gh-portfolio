import { useTranslation } from "react-i18next";
import { FeedbackPage } from "../../components/error/FeedbackPage";
import { useSeoMeta } from "../../hooks/useSeoMeta";

export const NotFound = () => {
    const { t } = useTranslation();
    useSeoMeta({ title: t("feedback.notFound.title"), noIndex: true });
    return <FeedbackPage kind="notFound" />;
};
