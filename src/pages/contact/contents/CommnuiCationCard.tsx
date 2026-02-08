import { useEffect, useState } from "react";
import { HiMail, HiUser, HiCalendar, HiLocationMarker, HiBriefcase, HiCheckCircle } from "react-icons/hi";
import { FaGithub } from "react-icons/fa";
import { useTranslation } from "react-i18next";

export const CommunicationCard = () => {
    const { t } = useTranslation();
    const EMAIL = import.meta.env.VITE_EMAIL;
    const GITHUB = import.meta.env.VITE_GITHUB;

    const [copied, setCopied] = useState(false);

    // 경력 계산 (2023.07.01 기준)
    const calculateCareer = () => {
        const startDate = new Date(2023, 6, 1); // 2023년 7월 1일 (월은 0부터 시작)
        const today = new Date();

        let years = today.getFullYear() - startDate.getFullYear();
        let months = today.getMonth() - startDate.getMonth();

        if (months < 0) {
            years--;
            months += 12;
        }

        if (years > 0) {
            return t("pages.contact.communicationCard.careerYearsMonths", { years, months });
        }
        return t("pages.contact.communicationCard.careerMonths", { months });
    };

    useEffect(() => {
        if (!copied) return;
        const t = window.setTimeout(() => setCopied(false), 1500);
        return () => window.clearTimeout(t);
    }, [copied]);

    const legacyCopy = (text: string) => {
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.setAttribute("readonly", "");
        ta.style.position = "fixed";
        ta.style.top = "0";
        ta.style.left = "0";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        const ok = document.execCommand("copy");
        document.body.removeChild(ta);
        return ok;
    };

    const handleCopyEmail = async () => {
        const text = String(EMAIL ?? "");
        if (!text) return;

        try {
            if (navigator.clipboard?.writeText) {
                await navigator.clipboard.writeText(text);
                setCopied(true);
                return;
            }
        } catch {
            // 아래 폴백으로 진행
        }

        // 폴백: 일부 로컬/브라우저에서도 동작
        const ok = legacyCopy(text);
        setCopied(ok);
    };
    return (
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-5 md:p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_18px_60px_rgba(0,0,0,0.45)] space-y-5">
            {/* 헤더 */}
            <div className="flex items-start justify-between gap-3 pb-4 border-b border-white/10">
                <div>
                    <h2 className="text-xl md:text-2xl font-bold flex items-center gap-2">
                        <HiUser className="w-5 h-5 text-primary" />
                        {t("pages.contact.communicationCard.quickContact")}
                    </h2>
                    <p className="mt-2 text-sm text-white/70">
                        {t("pages.contact.communicationCard.contactPrompt")}
                    </p>
                </div>

                <button
                    type="button"
                    onClick={handleCopyEmail}
                    className="relative shrink-0 rounded-lg border border-primary/30 bg-primary/10 px-3 py-2 text-xs font-medium text-primary hover:bg-primary/20 transition-all active:scale-95"
                    title={t("pages.contact.communicationCard.copyEmail")}
                >
                    {t("pages.contact.communicationCard.copyEmail")}
                </button>

                {copied && (
                    <div className="fixed top-20 right-4 md:right-8 rounded-lg bg-primary/90 px-4 py-2.5 text-sm font-medium text-white shadow-lg flex items-center gap-2 animate-[fadeIn_0.2s_ease-out]">
                        <HiCheckCircle className="w-4 h-4" />
                        {t("pages.contact.communicationCard.emailCopied")}
                    </div>
                )}
            </div>

            {/* 프로필 요약 */}
            <div className="rounded-xl border border-white/10 bg-linear-to-br from-black/30 to-black/10 p-4">
                <dl className="grid grid-cols-2 gap-4">
                    <div className="flex items-start gap-2">
                        <HiUser className="w-4 h-4 text-primary/70 mt-0.5 shrink-0" />
                        <div>
                            <dt className="text-xs text-white/50">{t("pages.contact.communicationCard.name")}</dt>
                            <dd className="mt-1 font-semibold text-white">{t("pages.contact.communicationCard.nameValue")}</dd>
                        </div>
                    </div>
                    <div className="flex items-start gap-2">
                        <HiBriefcase className="w-4 h-4 text-primary/70 mt-0.5 shrink-0" />
                        <div>
                            <dt className="text-xs text-white/50">{t("pages.contact.communicationCard.career")}</dt>
                            <dd className="mt-1 font-semibold text-white">{calculateCareer()}</dd>
                        </div>
                    </div>
                    <div className="flex items-start gap-2">
                        <HiCalendar className="w-4 h-4 text-primary/70 mt-0.5 shrink-0" />
                        <div>
                            <dt className="text-xs text-white/50">{t("pages.contact.communicationCard.birthDate")}</dt>
                            <dd className="mt-1 font-semibold text-white">1994-05-04</dd>
                        </div>
                    </div>
                    <div className="flex items-start gap-2">
                        <HiLocationMarker className="w-4 h-4 text-primary/70 mt-0.5 shrink-0" />
                        <div>
                            <dt className="text-xs text-white/50">{t("pages.contact.communicationCard.residence")}</dt>
                            <dd className="mt-1 font-semibold text-white">{t("pages.contact.communicationCard.residenceValue")}</dd>
                        </div>
                    </div>
                </dl>
            </div>

            {/* 채널 카드 */}
            <div className="grid gap-3">
                <a
                    href={`mailto:${EMAIL}`}
                    className="group rounded-xl border border-white/10 bg-linear-to-r from-black/30 to-black/10 p-4 hover:border-primary/30 hover:bg-primary/5 transition-all active:scale-[0.99]"
                >
                    <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                            <HiMail className="w-5 h-5 text-primary" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-xs text-white/50 font-medium">Email</p>
                            <p className="mt-0.5 font-semibold text-white break-all truncate">
                                {EMAIL}
                            </p>
                        </div>
                        <span className="text-xs text-white/60 group-hover:text-primary transition-colors shrink-0">
                            {t("pages.contact.communicationCard.sendAction")}
                        </span>
                    </div>
                </a>

                <a
                    href={GITHUB}
                    target="_blank"
                    rel="noreferrer"
                    className="group rounded-xl border border-white/10 bg-gradient-to-r from-black/30 to-black/10 p-4 hover:border-primary/30 hover:bg-primary/5 transition-all active:scale-[0.99]"
                >
                    <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                            <FaGithub className="w-5 h-5 text-primary" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-xs text-white/50 font-medium">GitHub</p>
                            <p className="mt-0.5 font-semibold text-white break-all truncate">
                                {GITHUB}
                            </p>
                        </div>
                        <span className="text-xs text-white/60 group-hover:text-primary transition-colors shrink-0">
                            {t("pages.contact.communicationCard.openAction")}
                        </span>
                    </div>
                </a>
            </div>

            {/* 관심/태그 */}
            <div className="rounded-xl border border-white/10 bg-gradient-to-br from-black/30 to-black/10 p-4 space-y-3">
                <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                    <p className="text-sm text-white/70">
                        {t("pages.contact.communicationCard.interests")}{" "}
                        <span className="text-white font-semibold ml-1">
                            Frontend / Full-stack
                        </span>
                    </p>
                </div>

                <div className="flex flex-wrap gap-2">
                    {["React", "TypeScript", "UI/UX", "Performance"].map((t) => (
                        <span
                            key={t}
                            className="text-xs font-medium text-primary/90 bg-primary/10 border border-primary/30 px-3 py-1.5 rounded-full hover:bg-primary/20 transition-colors"
                        >
                            {t}
                        </span>
                    ))}
                </div>

                <p className="text-sm text-white/60 pt-2 border-t border-white/5">
                    {t("pages.contact.communicationCard.welcomeMessage")}
                </p>
            </div>
        </div>
    );
};
