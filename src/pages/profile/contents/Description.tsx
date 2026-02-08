import { useTranslation } from "react-i18next";

export const Description = () => {
    const { t } = useTranslation();

    return (
        <ul className="w-full text-[clamp(0.8rem,2vw,1rem)]">
            <li>{t("pages.profile.description.intro")}</li>
            <li>
                {t("pages.profile.description.frontend")}
            </li>
            <li>
                {t("pages.profile.description.collaboration")}
            </li>
            <li>
                {t("pages.profile.description.ux")}
            </li>
        </ul>
    );
};
