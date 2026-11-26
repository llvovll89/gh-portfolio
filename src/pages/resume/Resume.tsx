import { uiText } from "../../utils/uiText";
import { useState } from "react";
import {
    LuBriefcase,
    LuCode,
    LuDownload,
    LuGraduationCap,
    LuUserRound,
} from "react-icons/lu";
import { PageHeader } from "../../components/pageHeader/PageHeader";
import { careers } from "../profile/careerData";
import { SKILL_GROUPS } from "../profile/skillData";
import { useTranslation } from "react-i18next";
import { Aside } from "../../components/aside/Aside";
import { Contents } from "../../components/contents/Contents";
import { Header } from "../../components/header/Header";
import { useSeoMeta } from "../../hooks/useSeoMeta";
import { RESUME_FILES, resumeLangFor, type ResumeLang } from "../../constants/resumeFiles";
import { logger } from "../../utils/logger";


export const Resume = () => {
    const { t, i18n } = useTranslation();
    const resumeLang = resumeLangFor(i18n.resolvedLanguage);
    const otherLang = resumeLang === "ko" ? "en" : "ko";
    const [downloadState, setDownloadState] = useState<"idle" | "loading" | "error">("idle");

    useSeoMeta({
        title: t("routes.resume"),
        description: uiText("웹 개발자 김건호의 경력, 기술 스택, 학력과 프로젝트 경험"),
        url: "/resume",
    });

    const sections = [
        {
            title: t("pages.resume.profileTitle"),
            Icon: LuUserRound,
            items: [
                { label: t("pages.resume.name"), value: uiText("김건호 (Geonho Kim)") },
                { label: t("pages.resume.email"), value: <a href="mailto:svvvs5579@naver.com" className="text-primary underline underline-offset-4">svvvs5579@naver.com</a> },
            ],
        },
        {
            title: t("pages.resume.experienceTitle"),
            Icon: LuBriefcase,
            // 프로필과 같은 careerData를 사용해 두 페이지의 경력 표기가 어긋나지 않게 함
            items: careers.map(career => ({
                label: career.period,
                value: `${t(`pages.profile.personalHistory.${career.company}`)}, ${career.position}`,
            })),
        },
        {
            title: t("pages.resume.educationTitle"),
            Icon: LuGraduationCap,
            items: [
                { label: t("pages.resume.highSchool"), value: t("pages.resume.highSchoolValue") },
                { label: t("pages.resume.university"), value: t("pages.resume.universityValue") },
            ],
        },
        {
            title: t("pages.resume.skillsTitle"),
            Icon: LuCode,
            items: [
                ...SKILL_GROUPS.map(group => ({ label: group.title, value: group.items.join(", ") })),
            ],
        },
    ];

    const handleDownloadResume = async (lang: ResumeLang = resumeLang) => {
        const { url, fileName } = RESUME_FILES[lang];
        if (downloadState === "loading") return;
        setDownloadState("loading");

        let objectUrl: string | null = null;
        let link: HTMLAnchorElement | null = null;

        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);

            objectUrl = URL.createObjectURL(await response.blob());
            link = document.createElement("a");
            link.href = objectUrl;
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            setDownloadState("idle");
        } catch (error) {
            logger.error("이력서 다운로드 실패", error);
            setDownloadState("error");
        } finally {
            if (link?.isConnected) link.remove();
            if (objectUrl) URL.revokeObjectURL(objectUrl);
        }
    };

    return (
        <>
            <Header />
            <Aside />
            <Contents>
                <section className="relative mx-auto w-full max-w-6xl px-2 pb-10 md:px-6">
                    <PageHeader
                        title={t("pages.resume.title")}
                        description={t("pages.resume.description")}
                        actions={
                            <div className="flex flex-wrap items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => { void handleDownloadResume(); }}
                                    disabled={downloadState === "loading"}
                                    className="workbench-button workbench-button-primary"
                                >
                                    <LuDownload aria-hidden="true" />
                                    {downloadState === "loading"
                                        ? t("pages.resume.downloading")
                                        : t("pages.resume.download")}
                                </button>
                                {/* 다른 언어본 — 한국어 UI 에서는 영문, en/ja UI 에서는 한국어 */}
                                <button
                                    type="button"
                                    onClick={() => { void handleDownloadResume(otherLang); }}
                                    disabled={downloadState === "loading"}
                                    className="workbench-button"
                                >
                                    <LuDownload aria-hidden="true" />
                                    {t(`pages.resume.download_${otherLang}`)}
                                </button>
                            </div>
                        }
                    />
                    <p className={`-mt-6 mb-2 min-h-5 text-sm ${downloadState === "error" ? "text-error" : "text-transparent"}`} role="status" aria-live="polite">
                        {downloadState === "error" ? t("pages.resume.downloadError") : ""}
                    </p>

                    <div className="resume-sections">
                        {sections.map(({ title, Icon, items }) => (
                            <section key={title} className="resume-section">
                                <div className="mb-5 flex items-center gap-3">
                                    <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
                                    <h2 className="text-lg font-bold text-foreground">{title}</h2>
                                </div>
                                <dl className="grid gap-4">
                                    {items.map((item) => (
                                        <div key={item.label} className="grid gap-1 sm:grid-cols-[7rem_1fr] sm:gap-4">
                                            <dt className="text-xs font-semibold text-muted">{item.label}</dt>
                                            <dd className="text-sm leading-6 text-foreground">{item.value}</dd>
                                        </div>
                                    ))}
                                </dl>
                            </section>
                        ))}
                    </div>
                </section>
            </Contents>
        </>
    );
};
