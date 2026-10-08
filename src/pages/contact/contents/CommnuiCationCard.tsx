import { useEffect, useState } from "react";
import { LuArrowUpRight, LuCheck, LuCopy, LuMail } from "react-icons/lu";
import { FaGithub } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import { CONTACT_EMAIL, CONTACT_GITHUB } from "../../../constants/contact";

export const CommunicationCard = () => {
    const { t } = useTranslation();
    const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "error">("idle");
    useEffect(() => {
        if (copyStatus === "idle") return;
        const timer = window.setTimeout(() => setCopyStatus("idle"), 4000);
        return () => window.clearTimeout(timer);
    }, [copyStatus]);
    const copyEmail = async () => {
        try {
            await navigator.clipboard.writeText(CONTACT_EMAIL);
            setCopyStatus("copied");
        } catch {
            setCopyStatus("error");
        }
    };
    return <section className="contact-channels" aria-labelledby="quick-contact">
        <header><h2 id="quick-contact">{t("pages.contact.communicationCard.quickContact")}</h2>
            <p>{t("pages.contact.communicationCard.contactPrompt")}</p>
        </header>
        <div className="contact-email">
            <LuMail aria-hidden="true" size={24} />
            <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
            <button type="button" className="workbench-button" onClick={copyEmail}>
                {copyStatus === "copied" ? <LuCheck aria-hidden="true" /> : <LuCopy aria-hidden="true" />}
                {t("pages.contact.communicationCard.copyEmail")}
            </button>
        </div>
        <p className={`contact-copy-status ${copyStatus === "error" ? "form-error" : ""}`} role="status">
            {copyStatus === "copied" ? t("pages.contact.communicationCard.emailCopied") : copyStatus === "error" ? t("pages.contact.communicationCard.copyError") : ""}
        </p>
        <a className="contact-github" href={CONTACT_GITHUB} target="_blank" rel="noopener noreferrer"><FaGithub aria-hidden="true" size={20} /><span>GitHub<span>{CONTACT_GITHUB.replace(/^https?:\/\//, "")}</span></span><LuArrowUpRight aria-hidden="true" /></a>
        <div className="contact-availability"><h3>{t("pages.contact.communicationCard.interests")}</h3><p>Frontend / Full-stack</p>
            <ul className="skill-tags">{["React", "TypeScript", "UI/UX", "Performance"].map(tag => <li key={tag}>{tag}</li>)}</ul>
        </div>
    </section>;
};
