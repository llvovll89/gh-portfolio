import { useTranslation } from "react-i18next";
import { LuArrowRight, LuMail } from "react-icons/lu";
import { TerminalCard } from "../../../../components/terminalCard/TerminalCard";
import { useHandlePushPath } from "../../../../hooks/useHandlePushPath";
import { CONTACT, PROJECTS } from "../../../../routes/route";

export const MainContents = () => {
    const { t } = useTranslation();
    const handlePushPath = useHandlePushPath();
    const proofPoints = [
        { value: "3+", label: t("pages.home.metricExperience") },
        { value: "6", label: t("pages.home.metricProjects") },
        { value: "66", label: t("pages.home.metricPosts") },
    ];

    return (
        <article className="relative min-h-full overflow-hidden px-4 py-10 sm:px-8 sm:py-14 lg:px-14 lg:py-16">
            <div aria-hidden="true" className="pointer-events-none absolute -right-40 -top-52 h-130 w-130 rounded-full bg-primary/14 blur-3xl" />
            <div className="relative mx-auto grid min-h-full max-w-7xl items-center gap-14 lg:grid-cols-[minmax(0,1.08fr)_minmax(360px,0.92fr)]">
                <section className="min-w-0">
                    <p className="mb-5 border-l-2 border-primary pl-3 text-xs font-semibold uppercase tracking-[0.18em] text-primary sm:text-sm">
                        {t("pages.home.badge")}
                    </p>
                    <h1 className="max-w-4xl text-[clamp(2.35rem,6vw,5.5rem)] font-black leading-[0.98] tracking-[-0.055em] text-white">
                        {t("pages.home.headlineLine1")}
                        <span className="mt-2 block text-primary">{t("pages.home.headlineLine2")}</span>
                    </h1>
                    <p className="mt-7 max-w-2xl text-base leading-7 text-white/68 sm:text-lg sm:leading-8">
                        {t("pages.home.summary")}
                    </p>
                    <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                        <button type="button" onClick={() => handlePushPath(PROJECTS)} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-primary px-6 text-sm font-bold text-slate-950 transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-[#18181b]">
                            {t("pages.home.viewProjects")}
                            <LuArrowRight className="h-4 w-4" aria-hidden="true" />
                        </button>
                        <button type="button" onClick={() => handlePushPath(CONTACT)} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-white/14 bg-white/4 px-6 text-sm font-bold text-white transition-colors hover:border-white/28 hover:bg-white/8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-[#18181b]">
                            <LuMail className="h-4 w-4" aria-hidden="true" />
                            {t("pages.home.getInTouch")}
                        </button>
                    </div>
                    <dl className="mt-12 grid max-w-2xl grid-cols-3 border-y border-white/10 py-5">
                        {proofPoints.map((item, index) => (
                            <div key={item.label} className={`min-w-0 px-3 first:pl-0 ${index > 0 ? "border-l border-white/10" : ""}`}>
                                <dt className="text-[11px] leading-4 text-white/48 sm:text-xs">{item.label}</dt>
                                <dd className="mt-1 text-xl font-black tracking-tight text-white sm:text-2xl">{item.value}</dd>
                            </div>
                        ))}
                    </dl>
                </section>
                <aside className="hidden lg:block" aria-label={t("pages.home.terminalPreview")}>
                    <div className="relative mx-auto max-w-md">
                        <div className="absolute -inset-8 rounded-[2rem] border border-primary/10 bg-primary/5" />
                        <div className="relative"><TerminalCard /></div>
                    </div>
                </aside>
            </div>
        </article>
    );
};
