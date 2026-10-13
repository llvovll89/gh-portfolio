import { useTranslation } from "react-i18next";
export const SkipLinks = () => {
    const { t } = useTranslation();
    const skip = (event: React.MouseEvent<HTMLAnchorElement>, id: string) => {
        event.preventDefault();
        const target = document.getElementById(id) ?? (id === "main-content" ? document.getElementById("detail-content") : null);
        target?.focus({ preventScroll: true });
    };
    return <nav aria-label={t("accessibility.skip")} className="skip-links">
        {[["main-content", "main"], ["main-navigation", "navigation"], ["header-tabs", "tabs"]].map(([id, key]) => <a key={id} href={"#" + id} className="skip-link" onClick={event => skip(event, id)}>{t("accessibility." + key)}</a>)}
    </nav>;
};
