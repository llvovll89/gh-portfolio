import { useEffect, useState } from "react";
import type { Project } from "../mocks/projectData";
import { CardDescAndSkills } from "./CardDescAndSkills";
import { useTranslation } from "react-i18next";

interface CardDetailProps {
    selected: Project;
    setSelectedProject: (index: number | null) => void;
}

export const CardDetail = ({ selected, setSelectedProject }: CardDetailProps) => {
    const { t } = useTranslation();
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // 애니메이션을 위해 약간의 지연 후 표시
        const timer = setTimeout(() => setIsVisible(true), 10);
        return () => clearTimeout(timer);
    }, []);

    const handleClose = () => {
        setIsVisible(false);
        setTimeout(() => setSelectedProject(null), 200);
    };

    return (
        <div
            className={[
                "fixed inset-0 z-50 flex items-center justify-center p-4",
                "bg-black/70 backdrop-blur-md",
                "transition-opacity duration-200",
                isVisible ? "opacity-100" : "opacity-0",
            ].join(" ")}
            onClick={handleClose}
            role="dialog"
            aria-modal="true"
        >
            <div
                className={[
                    "relative w-full max-w-4xl max-h-[90vh] overflow-y-auto scrolls",
                    "rounded-2xl border border-[#3e3e42]",
                    "bg-[#000000] text-slate-100",
                    "shadow-[0_30px_90px_rgba(0,0,0,0.5)]",
                    "transition-all duration-300 ease-out",
                    isVisible
                        ? "opacity-100 scale-100 translate-y-0"
                        : "opacity-0 scale-95 translate-y-4",
                ].join(" ")}
                onClick={(e) => e.stopPropagation()}
            >
                {/* 프로젝트 이미지 헤더 */}
                <div className="relative h-64 w-full overflow-hidden bg-[#252526]">
                    <img
                        src={selected.image}
                        alt={selected.title}
                        className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/40 to-transparent" />

                    {/* subtle highlight */}
                    <div className="pointer-events-none absolute inset-0">
                        <div className="absolute -top-24 left-1/2 h-48 w-[130%] -translate-x-1/2 rounded-full bg-linear-to-r from-primary/18 via-fuchsia-400/14 to-sky-400/18 blur-3xl" />
                    </div>

                    {/* 닫기 버튼 절대 위치 */}
                    <div className="absolute top-4 right-4">
                        <button
                            onClick={handleClose}
                            className={[
                                "group relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
                                "bg-[#2a2a2d]/90 backdrop-blur-sm text-slate-300",
                                "border border-[#3e3e42] shadow-lg",
                                "transition-all duration-200",
                                "hover:bg-[#2a2a2d] hover:scale-110 hover:text-white",
                                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#1e1e1e]",
                            ].join(" ")}
                            aria-label={t("pages.projects.close")}
                        >
                            <svg
                                className="h-5 w-5 transition-transform group-hover:rotate-90"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2}
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                        </button>
                    </div>
                </div>

                <div className="relative p-6 md:p-8">
                    {/* 타이틀과 배지 */}
                    <div className="mb-6">
                        <div className="flex items-center gap-3 mb-3">
                            <h3 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-100">
                                {selected.title}
                            </h3>
                            <span className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary">
                                {selected.scale}
                            </span>
                        </div>
                        <div className="h-1.5 w-20 rounded-full bg-linear-to-r from-primary via-fuchsia-400 to-sky-400" />
                    </div>

                    {/* 상세 설명 및 기술 스택 */}
                    <CardDescAndSkills project={selected} />

                    {/* 액션 버튼 */}
                    <div className="mt-8 flex flex-wrap items-center justify-end gap-3 pt-6 border-t border-[#3e3e42]">
                        <a
                            href={selected.link.projectUrl}
                            className={[
                                "group inline-flex items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold",
                                "bg-primary text-white",
                                "shadow-lg shadow-primary/25",
                                "transition-all duration-200",
                                "hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5",
                                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#1e1e1e]",
                            ].join(" ")}
                            target="_blank"
                            rel="noreferrer"
                        >
                            <span>{t("pages.projects.viewProject")}</span>
                            <svg className="h-4 w-4 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                        </a>

                        <a
                            href={selected.link.repositoryUrl}
                            className={[
                                "group inline-flex items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold",
                                "border-2 border-[#3e3e42] bg-[#2a2a2d] text-slate-300",
                                "transition-all duration-200",
                                "hover:border-primary/40 hover:bg-[#252526] hover:text-white hover:-translate-y-0.5",
                                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#1e1e1e]",
                            ].join(" ")}
                            target="_blank"
                            rel="noreferrer"
                        >
                            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                            </svg>
                            <span>{t("pages.projects.viewRepository")}</span>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};
