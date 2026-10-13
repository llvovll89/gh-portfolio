import { useTranslation } from "react-i18next";
export const RouteLoading = () => {
    const { t } = useTranslation();
    return <div role="status" aria-live="polite" className="fixed inset-0 z-50 grid place-items-center bg-base-navy text-foreground">
        <div className="flex items-center gap-3 text-sm"><span aria-hidden="true" className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />{t("feedback.loading")}</div>
    </div>;
};
