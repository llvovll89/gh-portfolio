import { useState } from "react";
import {
    LuBriefcase,
    LuCode,
    LuDownload,
    LuFileText,
    LuGraduationCap,
    LuUserRound,
} from "react-icons/lu";
import { useTranslation } from "react-i18next";
import { Aside } from "../../components/aside/Aside";
import { Contents } from "../../components/contents/Contents";
import { Header } from "../../components/header/Header";
import { useSeoMeta } from "../../hooks/useSeoMeta";
import { logger } from "../../utils/logger";

const RESUME_URL = "/assets/resume/김건호_이력서.pdf";

export const Resume = () => {
    const { t } = useTranslation();
    const [downloadState, setDownloadState] = useState<"idle" | "loading" | "error">("idle");

    useSeoMeta({
        title: "Resume",
        description: "웹 개발자 김건호의 경력, 기술 스택, 학력과 프로젝트 경험",
        url: "/resume",
    });

    const sections = [
        {
            title: t("pages.resume.profileTitle"),
            Icon: LuUserRound,
            items: [
                { label: t("pages.resume.name"), value: "김건호 (Kim Geon Ho)" },
                { label: t("pages.resume.email"), value: "svvvs5579@naver.com" },
            ],
        },
        {
            title: t("pages.resume.experienceTitle"),
            Icon: LuBriefcase,
            items: [
                { label: t("pages.resume.period"), value: t("pages.resume.experiencePeriod") },
                { label: t("pages.resume.position"), value: "Full-stack Developer" },
            ],
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
                { label: "Frontend", value: "React, TypeScript, Redux, Tailwind CSS" },
                { label: "Backend", value: "Java, Spring Boot, PostgreSQL, Oracle, Firebase" },
            ],
        },
    ];

    const handleDownloadResume = async () => {
        if (downloadState === "loading") return;
        setDownloadState("loading");

        let objectUrl: string | null = null;
        let link: HTMLAnchorElement | null = null;

        try {
            const response = await fetch(RESUME_URL);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);

            objectUrl = URL.createObjectURL(await response.blob());
            link = document.createElement("a");
            link.href = objectUrl;
            link.download = "김건호_이력서.pdf";
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
            <Contents className="select-none">
                <section className="relative mx-auto w-full max-w-6xl px-2 pb-10 md:px-6">
                    <header className="mb-8 border-b border-white/10 pb-7 sm:mb-10">
                        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
                            <div className="max-w-2xl">
                                <div className="mb-3 flex items-center gap-3">
                                    <span className="rounded-lg bg-primary/10 p-2" aria-hidden="true">
                                        <LuFileText className="h-6 w-6 text-primary" />
                                    </span>
                                    <h1 className="text-[clamp(1.75rem,3vw,2.5rem)] font-extrabold tracking-tight text-white/92">
                                        {t("pages.resume.title")}
                                    </h1>
                                </div>
                                <p className="text-sm leading-6 text-white/64 sm:text-base">
                                    {t("pages.resume.description")}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={handleDownloadResume}
                                disabled={downloadState === "loading"}
                                className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-bold text-slate-950 transition-transform hover:-translate-y-0.5 active:translate-y-px disabled:cursor-wait disabled:opacity-65 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-[#18181b]"
                            >
                                <LuDownload className="h-4 w-4" aria-hidden="true" />
                                {downloadState === "loading"
                                    ? t("pages.resume.downloading")
                                    : t("pages.resume.download")}
                            </button>
                        </div>
                        <p className={`mt-3 min-h-5 text-sm ${downloadState === "error" ? "text-red-300" : "text-transparent"}`} role="status" aria-live="polite">
                            {downloadState === "error" ? t("pages.resume.downloadError") : ""}
                        </p>
                    </header>

                    <div className="resume-sections">
                        {sections.map(({ title, Icon, items }) => (
                            <section key={title} className="resume-section">
                                <div className="mb-5 flex items-center gap-3">
                                    <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
                                    <h2 className="text-lg font-bold text-white/90">{title}</h2>
                                </div>
                                <dl className="grid gap-4">
                                    {items.map((item) => (
                                        <div key={item.label} className="grid gap-1 sm:grid-cols-[7rem_1fr] sm:gap-4">
                                            <dt className="text-xs font-semibold text-white/42">{item.label}</dt>
                                            <dd className="text-sm leading-6 text-white/78">{item.value}</dd>
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
