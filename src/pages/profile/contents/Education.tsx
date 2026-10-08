import { useTranslation } from "react-i18next";

export const Education = () => {
    const { t } = useTranslation();
    return <section className="profile-section" aria-labelledby="profile-education">
        <h2 id="profile-education">{t("pages.profile.education.title")}</h2>
        <dl className="profile-education">
            {[["2020. 02", "university"], ["2013. 02", "highSchool"]].map(([date, school]) => <div key={school}>
                <dt>{t(`pages.profile.education.${school}`)}</dt>
                <dd>{date} <span>{t("pages.profile.education.graduated")}</span></dd>
            </div>)}
        </dl>
    </section>;
};
