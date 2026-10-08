import { useTranslation } from "react-i18next";

export const PersonalHistory = () => {
    const { t } = useTranslation();
    const careers = [
        { period: "2026. 02 -", company: "nanoCompany", position: "Full-stack Developer", active: true },
        { period: "2023. 07 - 2026. 02", company: "company", position: "Frontend Developer", active: false },
    ];
    return <section className="profile-section" aria-labelledby="profile-history">
        <h2 id="profile-history">{t("pages.profile.personalHistory.title")}</h2>
        <ol className="profile-careers">
            {careers.map(career => <li key={career.company}>
                <p className="career-period">{career.period}{career.active && <span>{t("pages.profile.personalHistory.currentlyEmployed")}</span>}</p>
                <div><h3>{t(`pages.profile.personalHistory.${career.company}`)}</h3><p>{career.position}</p>
                    {!career.active && <p className="career-description">{t("pages.profile.personalHistory.description")}</p>}
                </div>
            </li>)}
        </ol>
    </section>;
};
