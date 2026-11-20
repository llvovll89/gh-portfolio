import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { LuArrowLeft, LuArrowUpRight, LuHouse, LuRefreshCw } from "react-icons/lu";

export function FeedbackPage({ kind, onRetry, onHome, backTo }: { kind: "notFound" | "error" | "loadError"; onRetry?: () => void; onHome?: () => void; backTo?: string }) {
    const { t } = useTranslation();
    return <main id="main-content" tabIndex={-1} className="flex min-h-dvh w-full items-center justify-center bg-base-navy px-5 py-12 text-foreground">
        <section className="w-full max-w-xl rounded-xl border border-line bg-panel p-6 sm:p-10" aria-labelledby="feedback-title">
            <p className="mb-5 font-mono text-sm text-primary">{kind === "notFound" ? "404.tsx" : "recovery.tsx"}</p>
            <h1 id="feedback-title" className="text-2xl font-bold sm:text-3xl">{t("feedback." + kind + ".title")}</h1>
            <p className="mt-4 break-words text-sm leading-7 text-muted">{t("feedback." + kind + ".description")}</p>
            <div className="mt-7 flex flex-wrap gap-3">
                {onRetry && <button type="button" onClick={onRetry} className="workbench-button workbench-button-primary"><LuRefreshCw aria-hidden="true" />{t("feedback.retry")}</button>}
                {backTo && <Link to={backTo} className="workbench-button"><LuArrowLeft aria-hidden="true" />{t("feedback.backToList")}</Link>}
                <Link to="/" onClick={onHome} className="workbench-button"><LuHouse aria-hidden="true" />{t("feedback.home")}</Link>
            </div>
            {/* 404에서 바로 이어갈 수 있는 주요 페이지 */}
            {kind === "notFound" && <nav className="mt-8 border-t border-line pt-6" aria-labelledby="feedback-suggestions">
                <h2 id="feedback-suggestions" className="text-sm font-semibold text-muted">{t("feedback.suggestions")}</h2>
                <ul className="mt-2">
                    {([["/projects", "routes.projects"], ["/blog", "routes.blog"], ["/profile", "routes.profile"]] as const).map(([to, label]) => (
                        <li key={to}><Link to={to} className="flex min-h-11 items-center justify-between border-b border-line text-sm hover:text-primary">{t(label)}<LuArrowUpRight aria-hidden="true" /></Link></li>
                    ))}
                </ul>
            </nav>}
        </section>
    </main>;
}
