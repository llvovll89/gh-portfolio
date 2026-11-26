import { uiText } from "../../utils/uiText";
import { RESUME_FILES, resumeLangFor } from "../../constants/resumeFiles";
import { OptimizedImage } from "../../components/OptimizedImage";
import { Aside } from "../../components/aside/Aside";
import { Contents } from "../../components/contents/Contents";
import { Header } from "../../components/header/Header";
import { Skills } from "./contents/Skills";
import { Education } from "./contents/Education";
import { PersonalHistory } from "./contents/PersonalHistory";
import { useSeoMeta } from "../../hooks/useSeoMeta";
import { useTranslation } from "react-i18next";
import { LuDownload, LuMail } from "react-icons/lu";
import { FaGithub } from "react-icons/fa";
import { CONTACT_EMAIL, CONTACT_GITHUB } from "../../constants/contact";

export const Profile = () => {
    const { t, i18n } = useTranslation();
    const resume = RESUME_FILES[resumeLangFor(i18n.resolvedLanguage)];
    useSeoMeta({ title: t("routes.profile"), description: uiText("풀스택 웹 개발자 김건호의 프로필, 기술 스택, 학력, 경력 소개"), url: "/profile" });
    return <>
        <Header /><Aside />
        <Contents>
            <section className="profile-page">
                <header className="profile-intro">
                    <OptimizedImage src="/assets/images/kimgeonho/증명사진.png" alt={t("pages.profile.photoAlt")} sizes="112px" width={112} height={112} />
                    <div>
                        <h1>김건호 <span>Geonho Kim</span></h1>
                        <p className="profile-role">Full-stack Web Developer</p>
                        <p className="profile-summary">{t("pages.home.summary")}</p>
                        <div className="profile-links">
                            <a href={CONTACT_GITHUB} target="_blank" rel="noopener noreferrer"><FaGithub aria-hidden="true" /> GitHub</a>
                            <a href={`mailto:${CONTACT_EMAIL}`}><LuMail aria-hidden="true" /> {CONTACT_EMAIL}</a>
                            {/* 모바일 하단 내비에서 이력서 탭이 빠졌으므로 프로필에서 바로 PDF를 받을 수 있게 함 */}
                            <a href={resume.url} download={resume.fileName}><LuDownload aria-hidden="true" /> {t("pages.profile.downloadResume")}</a>
                        </div>
                    </div>
                </header>
                <div className="profile-sections"><PersonalHistory /><Skills /><Education /></div>
            </section>
        </Contents>
    </>;
};
