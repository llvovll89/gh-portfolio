import { useRef, useState } from "react";
import { LuCheck, LuMail, LuSend } from "react-icons/lu";
import { useTranslation } from "react-i18next";
import emailjs from "@emailjs/browser";
import { CONTACT_EMAIL } from "../../../constants/contact";
import { buildContactMailto } from "../../../utils/contactMailto";

const SERVICE_ID = (import.meta.env.VITE_EMAILJS_SERVICE_ID as string | undefined)?.trim() ?? "";
const TEMPLATE_ID = (import.meta.env.VITE_EMAILJS_TEMPLATE_ID as string | undefined)?.trim() ?? "";
const PUBLIC_KEY = (import.meta.env.VITE_EMAILJS_PUBLIC_KEY as string | undefined)?.trim() ?? "";
const EMAILJS_READY = !!(SERVICE_ID && TEMPLATE_ID && PUBLIC_KEY);
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const MessageCardForm = () => {
    const { t } = useTranslation();
    const [name, setName] = useState("");
    const [fromEmail, setFromEmail] = useState("");
    const [message, setMessage] = useState("");
    const [errors, setErrors] = useState({ name: "", email: "", message: "" });
    const [status, setStatus] = useState<"idle" | "sending" | "success" | "error" | "mailOpened">("idle");
    const sending = useRef(false);

    const handleSend = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (sending.current) return;
        const nextErrors = {
            name: name.trim() ? "" : t("pages.contact.messageForm.nameRequired"),
            email: EMAIL_REGEX.test(fromEmail.trim()) ? "" : t("pages.contact.messageForm.emailInvalid"),
            message: message.trim() ? "" : t("pages.contact.messageForm.messageRequired"),
        };
        setErrors(nextErrors);
        if (Object.values(nextErrors).some(Boolean)) {
            const field = !name.trim() ? "contact-name" : nextErrors.email ? "contact-email" : "contact-message";
            document.getElementById(field)?.focus();
            return;
        }
        if (!EMAILJS_READY) {
            const subject = t("pages.contact.messageForm.mailSubject", { name: name.trim() });
            const body = `${message.trim()}\n\n${t("pages.contact.messageForm.name")}: ${name.trim()}\n${t("pages.contact.messageForm.email")}: ${fromEmail.trim()}`;
            window.location.href = buildContactMailto(CONTACT_EMAIL, subject, body);
            setStatus("mailOpened");
            return;
        }
        sending.current = true;
        setStatus("sending");
        try {
            await emailjs.send(SERVICE_ID, TEMPLATE_ID,
                { from_name: name.trim(), "e-mail": fromEmail.trim(), text: message.trim(), to_name: "김건호", reply_to: fromEmail.trim() },
                { publicKey: PUBLIC_KEY });
            setStatus("success");
            setName(""); setFromEmail(""); setMessage("");
        } catch {
            setStatus("error");
        } finally {
            sending.current = false;
        }
    };
    const reset = () => {
        setName(""); setFromEmail(""); setMessage("");
        setErrors({ name: "", email: "", message: "" }); setStatus("idle");
    };
    return <form className="contact-form" onSubmit={handleSend} noValidate>
        <header><h2>{t("pages.contact.messageForm.title")}</h2>
            <p id="contact-form-description">{t(EMAILJS_READY ? "pages.contact.messageForm.directDescription" : "pages.contact.messageForm.description")}</p>
        </header>
        <div aria-live="polite" aria-atomic="true">
            {status === "success" && <p className="form-feedback form-success"><LuCheck aria-hidden="true" />{t("pages.contact.messageForm.success")}</p>}
            {status === "error" && <p className="form-feedback form-error" role="alert">{t("pages.contact.messageForm.error")} <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a></p>}
            {status === "mailOpened" && <p className="form-feedback">{t("pages.contact.messageForm.mailOpened")}</p>}
        </div>
        <fieldset disabled={status === "sending"} className="contact-fields" aria-describedby="contact-form-description">
            <div className="contact-field">
                <label htmlFor="contact-name">{t("pages.contact.messageForm.name")}</label>
                <input id="contact-name" name="name" autoComplete="name" value={name} required
                    aria-invalid={!!errors.name} aria-describedby={errors.name ? "contact-name-error" : undefined}
                    onChange={event => { setName(event.target.value); setErrors(current => ({ ...current, name: "" })); }}
                    placeholder={t("pages.contact.messageForm.namePlaceholder")} />
                {errors.name && <p id="contact-name-error" className="form-error">{errors.name}</p>}
            </div>
            <div className="contact-field">
                <label htmlFor="contact-email">{t("pages.contact.messageForm.email")}</label>
                <input id="contact-email" name="email" type="email" inputMode="email" autoComplete="email" value={fromEmail} required
                    aria-invalid={!!errors.email} aria-describedby={errors.email ? "contact-email-error" : undefined}
                    onChange={event => { setFromEmail(event.target.value); setErrors(current => ({ ...current, email: "" })); }}
                    placeholder={t("pages.contact.messageForm.emailPlaceholder")} />
                {errors.email && <p id="contact-email-error" className="form-error">{errors.email}</p>}
            </div>
            <div className="contact-field">
                <div className="contact-message-label"><label htmlFor="contact-message">{t("pages.contact.messageForm.message")}</label><span>{message.length} / 500</span></div>
                <textarea id="contact-message" name="message" value={message} maxLength={500} required
                    aria-invalid={!!errors.message} aria-describedby={errors.message ? "contact-message-error" : "contact-message-hint"}
                    onChange={event => { setMessage(event.target.value); setErrors(current => ({ ...current, message: "" })); }}
                    placeholder={t("pages.contact.messageForm.messagePlaceholder")}
                    onKeyDown={event => { if ((event.ctrlKey || event.metaKey) && event.key === "Enter") event.currentTarget.form?.requestSubmit(); }} />
                <span id="contact-message-hint" className="sr-only">{t("pages.contact.messageForm.messageHint")}</span>
                {errors.message && <p id="contact-message-error" className="form-error">{errors.message}</p>}
            </div>
            <div className="contact-form-actions">
                <button type="button" className="workbench-button" onClick={reset}>{t("pages.contact.messageForm.reset")}</button>
                <button type="submit" className="workbench-button workbench-button-primary">
                    {EMAILJS_READY ? <LuSend aria-hidden="true" /> : <LuMail aria-hidden="true" />}
                    {t(status === "sending" ? "pages.contact.messageForm.sending" : EMAILJS_READY ? "pages.contact.messageForm.directSend" : "pages.contact.messageForm.send")}
                </button>
            </div>
        </fieldset>
        <p className="contact-form-notice">{t(EMAILJS_READY ? "pages.contact.messageForm.directNotice" : "pages.contact.messageForm.infoNotice")}</p>
    </form>;
};
