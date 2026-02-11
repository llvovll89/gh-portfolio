import { useMemo, useState } from "react";
import { HiMail, HiUser, HiChatAlt2, HiRefresh, HiPaperAirplane, HiInformationCircle } from "react-icons/hi";
import { useTranslation } from "react-i18next";

export const MessageCardForm = () => {
    const { t } = useTranslation();
    const EMAIL = import.meta.env.VITE_EMAIL;

    const [name, setName] = useState("");
    const [fromEmail, setFromEmail] = useState("");
    const [message, setMessage] = useState("");

    const mailtoHref = useMemo(() => {
        const subject = `[Portfolio] ${name || "Contact"} (${fromEmail || "no-email"})`;
        const body = `이름: ${name}\n이메일: ${fromEmail}\n\n메시지:\n${message}`;
        return `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    }, [EMAIL, name, fromEmail, message]);

    const handleReset = () => {
        setName("");
        setFromEmail("");
        setMessage("");
    };

    return (
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-3 md:p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_18px_60px_rgba(0,0,0,0.45)] space-y-5">
            {/* 헤더 */}
            <div className="pb-4 border-b border-white/10">
                <h2 className="text-[clamp(1rem,2vw,1.25rem)] md:text-2xl font-bold flex items-center gap-2">
                    <HiChatAlt2 className="w-5 h-5 text-primary" />
                    {t("pages.contact.messageForm.title")}
                </h2>
                <p className="mt-2 text-[clamp(0.75rem,1vw,0.9rem)] text-white/70">
                    {t("pages.contact.messageForm.description")}
                </p>
            </div>

            {/* 폼 필드 */}
            <div className="grid gap-4">
                <label className="grid gap-2">
                    <span className="text-sm font-medium text-white/70 flex items-center gap-2">
                        <HiUser className="w-4 h-4 text-primary/70" />
                        {t("pages.contact.messageForm.name")}
                    </span>
                    <input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="rounded-xl border border-white/10 bg-gradient-to-br from-black/30 to-black/10 sm:px-4 px-3 sm:py-3 py-2 outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/30 transition-all placeholder:text-white/30"
                        placeholder={t("pages.contact.messageForm.namePlaceholder")}
                        autoComplete="name"
                    />
                </label>

                <label className="grid gap-2">
                    <span className="text-sm font-medium text-white/70 flex items-center gap-2">
                        <HiMail className="w-4 h-4 text-primary/70" />
                        {t("pages.contact.messageForm.email")}
                    </span>
                    <input
                        value={fromEmail}
                        onChange={(e) => setFromEmail(e.target.value)}
                        className="rounded-xl border border-white/10 bg-linear-to-br from-black/30 to-black/10 sm:px-4 px-3 sm:py-3 py-2 outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/30 transition-all placeholder:text-white/30"
                        placeholder={t("pages.contact.messageForm.emailPlaceholder")}
                        autoComplete="email"
                        inputMode="email"
                    />
                </label>

                <label className="grid gap-2">
                    <span className="text-sm font-medium text-white/70 flex items-center gap-2">
                        <HiChatAlt2 className="w-4 h-4 text-primary/70" />
                        {t("pages.contact.messageForm.message")}
                    </span>
                    <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className="min-h-40 md:min-h-36 resize-y rounded-xl border border-white/10 bg-linear-to-br from-black/30 to-black/10 sm:px-4 px-3 sm:py-3 py-2 outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/30 transition-all text-[clamp(0.75rem,1vw,0.875rem)] placeholder:text-white/30"
                        placeholder={t("pages.contact.messageForm.messagePlaceholder")}
                    />
                </label>

                {/* 버튼 그룹 */}
                <div className="flex flex-wrap gap-3 justify-end pt-2">
                    <button
                        type="button"
                        onClick={handleReset}
                        className="rounded-xl border border-white/10 bg-linear-to-r from-black/30 to-black/10 flex-1 sm:px-4 px-3 sm:py-2.5 py-2 text-sm font-medium text-white/80 hover:border-white/20 hover:bg-white/5 transition-all active:scale-95 flex items-center justify-center gap-2"
                    >
                        <HiRefresh className="w-4 h-4" />
                        {t("pages.contact.messageForm.reset")}
                    </button>

                    <a
                        href={mailtoHref}
                        className="rounded-xl bg-linear-to-r from-primary to-primary/80 sm:px-5 px-4 sm:py-2.5 py-2 text-sm font-semibold text-white hover:from-primary/90 hover:to-primary/70 transition-all active:scale-95 flex items-center gap-2 shadow-lg shadow-primary/20"
                    >
                        <HiPaperAirplane className="w-4 h-4" />
                        {t("pages.contact.messageForm.send")}
                    </a>
                </div>

                {/* 안내 문구 */}
                <div className="flex items-start gap-2 rounded-lg bg-primary/5 border border-primary/20 sm:px-3 px-2 sm:py-2.5 py-2">
                    <HiInformationCircle className="w-4 h-4 text-primary/70 mt-0.5 shrink-0" />
                    <p className="text-xs text-white/60">
                        {t("pages.contact.messageForm.infoNotice")}
                    </p>
                </div>
            </div>
        </div>
    );
};
