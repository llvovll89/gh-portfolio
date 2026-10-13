import { useTranslation } from "react-i18next";
import { usePWAInstall } from "../../hooks/usePWAInstall";
import { useCheckedMobile } from "../../hooks/useCheckedMobile";
import { SURFACE_LAYERS } from "../../constants/layout";

export const PWAInstallBanner = () => {
    const { t } = useTranslation();
    const mobile = useCheckedMobile();
    const { state, dismiss } = usePWAInstall();
    if (!mobile || state.status === "idle" || state.status === "installed") return null;
    const ios = state.status.startsWith("ios-");
    return <aside role="region" aria-label={t("pwa.title")} style={{ zIndex: SURFACE_LAYERS.notice }} className="fixed bottom-[calc(5.5rem+env(safe-area-inset-bottom))] left-1/2 w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 rounded-xl border border-line bg-panel p-4 text-sm text-foreground shadow-xl">
        <div className="mb-3 flex items-center justify-between gap-3"><p className="font-semibold">{t("pwa.title")}</p><button type="button" className="workbench-button min-h-11" onClick={dismiss}>{t("accessibility.close")}</button></div>
        <p className="leading-6 text-muted">{t("pwa.description")}</p>
        {state.status === "android" ? <button type="button" onClick={state.prompt} className="workbench-button workbench-button-primary mt-3">{t("pwa.install")}</button> : <p className="mt-3 leading-6 text-muted">{t(ios ? "pwa.ios" : "pwa.manual")}</p>}
    </aside>;
};
