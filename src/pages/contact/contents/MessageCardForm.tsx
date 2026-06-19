import { useMemo, useState } from "react";
import { LuMail, LuUser, LuMessageCircle, LuRefreshCw, LuSend, LuInfo, LuCircleCheck, LuCircleX } from "react-icons/lu";
import { useTranslation } from "react-i18next";
import emailjs from "@emailjs/browser";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const SERVICE_ID = (import.meta.env.VITE_EMAILJS_SERVICE_ID as string | undefined)?.trim() ?? "";
const TEMPLATE_ID = (import.meta.env.VITE_EMAILJS_TEMPLATE_ID as string | undefined)?.trim() ?? "";
const PUBLIC_KEY = (import.meta.env.VITE_EMAILJS_PUBLIC_KEY as string | undefined)?.trim() ?? "";
const EMAILJS_READY = !!(SERVICE_ID && TEMPLATE_ID && PUBLIC_KEY);

export const MessageCardForm = () => {
    const { t } = useTranslation();

    const [name, setName] = useState("");
    const [fromEmail, setFromEmail] = useState("");
    const [message, setMessage] = useState("");
    const [nameError, setNameError] = useState("");
    const [emailError, setEmailError] = useState("");
    const [messageError, setMessageError] = useState("");
    const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");

    const isDisabled = useMemo(() => !EMAILJS_READY || status === "sending", [status]);

    const validate = () => {
        let valid = true;
        if (!name.trim()) { setNameError("이름을 입력해주세요."); valid = false; } else setNameError("");
        if (!fromEmail.trim()) { setEmailError("이메일을 입력해주세요."); valid = false; }
        else if (!EMAIL_REGEX.test(fromEmail)) { setEmailError("올바른 이메일 형식이 아닙니다."); valid = false; }
        else setEmailError("");
        if (!message.trim()) { setMessageError("메시지를 입력해주세요."); valid = false; } else setMessageError("");
        return valid;
    };

    const handleSend = async () => {
        if (!validate()) return;

        setStatus("sending");
        try {
            await emailjs.send(
                SERVICE_ID,
                TEMPLATE_ID,
                { from_name: name, "e-mail": fromEmail, text: message, to_name: "김건호", reply_to: fromEmail },
                { publicKey: PUBLIC_KEY },
            );
            setStatus("success");
            setName(""); setFromEmail(""); setMessage("");
        } catch {
            setStatus("error");
        }
    };

    const handleReset = () => {
        setName(""); setFromEmail(""); setMessage("");
        setNameError(""); setEmailError(""); setMessageError("");
        setStatus("idle");
    };

    return (
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-3 md:p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_18px_60px_rgba(0,0,0,0.45)] space-y-5">
            {/* 헤더 */}
            <div className="pb-4 border-b border-white/10">
                <h2 className="text-[clamp(1rem,2vw,1.25rem)] md:text-2xl font-bold flex items-center gap-2">
                    <LuMessageCircle className="w-5 h-5 text-primary" />
                    {t("pages.contact.messageForm.title")}
                </h2>
                <p className="mt-2 text-[clamp(0.75rem,1vw,0.9rem)] text-white/70">
                    {t("pages.contact.messageForm.description")}
                </p>
            </div>

            {/* 전송 결과 알림 */}
            {status === "success" && (
                <div className="flex items-center gap-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 px-3 py-2.5">
                    <LuCircleCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                    <p className="text-xs text-emerald-300">메시지가 성공적으로 전송되었습니다!</p>
                </div>
            )}
            {status === "error" && (
                <div className="flex items-center gap-2 rounded-lg bg-rose-500/10 border border-rose-500/30 px-3 py-2.5">
                    <LuCircleX className="w-4 h-4 text-rose-400 shrink-0" />
                    <p className="text-xs text-rose-300">전송에 실패했습니다. 잠시 후 다시 시도해 주세요.</p>
                </div>
            )}

            {/* 폼 필드 */}
            <div className="grid gap-4">
                <label className="grid gap-1.5">
                    <span className="text-sm font-medium text-white/70 flex items-center gap-2">
                        <LuUser className="w-4 h-4 text-primary/70" />
                        {t("pages.contact.messageForm.name")}
                    </span>
                    <input
                        value={name}
                        onChange={(e) => { setName(e.target.value); if (nameError) setNameError(""); }}
                        onKeyDown={(e) => { if (e.key === "Enter" && !isDisabled) handleSend(); }}
                        className={`rounded-xl border bg-linear-to-br from-black/30 to-black/10 sm:px-4 px-3 sm:py-3 py-2 outline-none transition-all placeholder:text-white/30 ${
                            nameError
                                ? 'border-rose-400/50 focus:ring-2 focus:ring-rose-400/30'
                                : 'border-white/10 focus:ring-2 focus:ring-primary/50 focus:border-primary/30'
                        }`}
                        placeholder={t("pages.contact.messageForm.namePlaceholder")}
                        autoComplete="name"
                    />
                    {nameError && <p className="text-xs text-rose-400" role="alert">{nameError}</p>}
                </label>

                <label className="grid gap-1.5">
                    <span className="text-sm font-medium text-white/70 flex items-center gap-2">
                        <LuMail className="w-4 h-4 text-primary/70" />
                        {t("pages.contact.messageForm.email")}
                    </span>
                    <input
                        value={fromEmail}
                        onChange={(e) => { setFromEmail(e.target.value); if (emailError) setEmailError(""); }}
                        onKeyDown={(e) => { if (e.key === "Enter" && !isDisabled) handleSend(); }}
                        className={`rounded-xl border bg-linear-to-br from-black/30 to-black/10 sm:px-4 px-3 sm:py-3 py-2 outline-none transition-all placeholder:text-white/30 ${
                            emailError
                                ? 'border-rose-400/50 focus:ring-2 focus:ring-rose-400/30'
                                : 'border-white/10 focus:ring-2 focus:ring-primary/50 focus:border-primary/30'
                        }`}
                        placeholder={t("pages.contact.messageForm.emailPlaceholder")}
                        autoComplete="email"
                        inputMode="email"
                    />
                    {emailError && <p className="text-xs text-rose-400" role="alert">{emailError}</p>}
                </label>

                <label className="grid gap-1.5">
                    <span className="text-sm font-medium text-white/70 flex items-center justify-between gap-2">
                        <span className="flex items-center gap-2">
                            <LuMessageCircle className="w-4 h-4 text-primary/70" />
                            {t("pages.contact.messageForm.message")}
                        </span>
                        <span
                            aria-live="polite"
                            aria-label={`${message.length}자 입력됨, 최대 500자`}
                            className={`text-xs tabular-nums transition-colors ${message.length > 450 ? 'text-rose-400' : message.length > 300 ? 'text-amber-400' : 'text-white/40'}`}
                        >
                            {message.length} / 500
                        </span>
                    </span>
                    <textarea
                        value={message}
                        onChange={(e) => { setMessage(e.target.value); if (messageError) setMessageError(""); }}
                        onKeyDown={(e) => { if (e.ctrlKey && e.key === "Enter" && !isDisabled) handleSend(); }}
                        maxLength={500}
                        className={`min-h-40 md:min-h-36 resize-y rounded-xl border bg-linear-to-br from-black/30 to-black/10 sm:px-4 px-3 sm:py-3 py-2 outline-none transition-all text-[clamp(0.75rem,1vw,0.875rem)] placeholder:text-white/30 ${
                            messageError
                                ? 'border-rose-400/50 focus:ring-2 focus:ring-rose-400/30'
                                : 'border-white/10 focus:ring-2 focus:ring-primary/50 focus:border-primary/30'
                        }`}
                        placeholder={t("pages.contact.messageForm.messagePlaceholder")}
                    />
                    {messageError && <p className="text-xs text-rose-400" role="alert">{messageError}</p>}
                </label>

                {/* 버튼 그룹 */}
                <div className="flex flex-wrap gap-3 justify-end pt-2">
                    <button
                        type="button"
                        onClick={handleReset}
                        className="rounded-xl border border-white/10 bg-linear-to-r from-black/30 to-black/10 flex-1 sm:px-4 px-3 sm:py-2.5 py-2 text-sm font-medium text-white/80 hover:border-white/20 hover:bg-white/5 transition-all active:scale-95 flex items-center justify-center gap-2"
                    >
                        <LuRefreshCw className="w-4 h-4" />
                        {t("pages.contact.messageForm.reset")}
                    </button>

                    <button
                        type="button"
                        onClick={handleSend}
                        disabled={isDisabled}
                        className="rounded-xl bg-linear-to-r from-primary to-primary/80 sm:px-5 px-4 sm:py-2.5 py-2 text-sm font-semibold text-white hover:from-primary/90 hover:to-primary/70 transition-all active:scale-95 flex items-center gap-2 shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {status === "sending" ? (
                            <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                        ) : (
                            <LuSend className="w-4 h-4" />
                        )}
                        {status === "sending" ? "전송 중..." : t("pages.contact.messageForm.send")}
                    </button>
                </div>

                {/* 안내 문구 */}
                <div className="flex items-start gap-2 rounded-lg bg-primary/5 border border-primary/20 sm:px-3 px-2 sm:py-2.5 py-2">
                    <LuInfo className="w-4 h-4 text-primary/70 mt-0.5 shrink-0" />
                    <div>
                        <p className="text-xs text-white/60">
                            {t("pages.contact.messageForm.infoNotice")}
                        </p>
                        {!EMAILJS_READY && (
                            <p className="mt-1 text-xs text-amber-400">
                                EmailJS 환경변수가 설정되지 않아 전송이 비활성화되었습니다.
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
