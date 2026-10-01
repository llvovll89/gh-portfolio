import { useCallback, useEffect, useRef, useState } from "react";
import { LuArrowUpRight, LuX } from "react-icons/lu";
import { SiGithub } from "react-icons/si";
import type { Project } from "../mocks/projectData";
import { CardDescAndSkills } from "./CardDescAndSkills";
import { useTranslation } from "react-i18next";
import { Portal } from "../../../components/Portal";
import { SURFACE_LAYERS } from "../../../constants/layout";

interface CardDetailProps {
    selected: Project;
    setSelectedProject: (index: number | null) => void;
}

export const CardDetail = ({ selected, setSelectedProject }: CardDetailProps) => {
    const { t } = useTranslation();
    const [isVisible, setIsVisible] = useState(false);
    const dialogRef = useRef<HTMLDivElement>(null);
    const closeButtonRef = useRef<HTMLButtonElement>(null);
    const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const handleClose = useCallback(() => {
        if (closeTimer.current) return;
        setIsVisible(false);
        closeTimer.current = setTimeout(() => setSelectedProject(null), window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 150);
    }, [setSelectedProject]);

    useEffect(() => {
        const timer = setTimeout(() => setIsVisible(true), 10);
        return () => { clearTimeout(timer); if (closeTimer.current) clearTimeout(closeTimer.current); };
    }, []);

    useEffect(() => {
        const scrollContainer = document.getElementById("main-content");
        const previousBodyOverflow = document.body.style.overflow;
        const previousContentOverflow = scrollContainer?.style.overflow ?? "";
        const previouslyFocused = document.activeElement as HTMLElement | null;
        const background = document.getElementById("root");
        const previousInert = background?.inert ?? false;
        document.body.style.overflow = "hidden";
        if (scrollContainer) scrollContainer.style.overflow = "hidden";
        if (background) background.inert = true;
        closeButtonRef.current?.focus();
        return () => {
            document.body.style.overflow = previousBodyOverflow;
            if (scrollContainer) scrollContainer.style.overflow = previousContentOverflow;
            if (background) background.inert = previousInert;
            previouslyFocused?.focus();
        };
    }, []);

    useEffect(() => {
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") { event.preventDefault(); event.stopImmediatePropagation(); handleClose(); }
            if (event.key !== "Tab") return;
            const controls = Array.from(dialogRef.current?.querySelectorAll<HTMLElement>('button:not(:disabled), a[href], [tabindex="0"]') ?? []).filter(element => element.getClientRects().length > 0);
            const first = controls[0];
            const last = controls[controls.length - 1];
            if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
            else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
        };
        document.addEventListener("keydown", onKeyDown, true);
        return () => document.removeEventListener("keydown", onKeyDown, true);
    }, [handleClose]);

    return (
        <Portal>
            <div className={`project-dialog-backdrop ${isVisible ? "is-visible" : ""}`} style={{ zIndex: SURFACE_LAYERS.projectDialog }} onClick={handleClose}>
                <div ref={dialogRef} className="project-dialog scrolls" role="dialog" aria-modal="true" aria-labelledby="card-detail-title" onClick={event => event.stopPropagation()}>
                    <header className="project-dialog-header">
                        <div><h2 id="card-detail-title">{selected.title}</h2><p>{selected.scale}{selected.status === "incomplete" ? ` / ${t("pages.projects.incomplete")}` : ""}</p></div>
                        <button ref={closeButtonRef} type="button" className="project-dialog-close" onClick={handleClose} aria-label={t("pages.projects.close")}><LuX aria-hidden="true" /></button>
                    </header>
                    <div className={`project-dialog-image${selected.previewLayout === "mobile" ? " project-dialog-image-mobile" : ""}`}>
                        <img src={selected.previewLayout === "mobile" ? selected.previewImage : selected.image} alt={selected.title} />
                    </div>
                    <div className="project-dialog-body"><CardDescAndSkills project={selected} /></div>
                    <footer className="project-dialog-actions">
                        <a href={selected.link.repositoryUrl} className="workbench-button" target="_blank" rel="noreferrer"><SiGithub aria-hidden="true" />{t("pages.projects.viewRepository")}</a>
                        {selected.link.projectUrl ? <a href={selected.link.projectUrl} className="workbench-button workbench-button-primary" target="_blank" rel="noreferrer">{t("pages.projects.viewProject")}<LuArrowUpRight aria-hidden="true" /></a> : <span className="project-dialog-unavailable">{t("pages.projects.unavailable")}</span>}
                    </footer>
                </div>
            </div>
        </Portal>
    );
};
