import { useTranslation } from "react-i18next";
import { useScrollAnimation } from "../../../hooks/useScrollAnimation";

export const PersonalHistory = () => {
    const { t } = useTranslation();
    const ref = useScrollAnimation();

    const careerList = [
        {
            period: "2023. 07 ~ 2026. 02",
            companyKey: "pages.profile.personalHistory.company",
            position: "Frontend Developer",
            descriptionKey: "pages.profile.personalHistory.description",
            isActive: true,
        },
    ];

    return (
        <article ref={ref} className="scroll-reveal w-full flex flex-col gap-4">
            <div className="w-full flex items-center gap-3 md:gap-5">
                <div className="flex-1 md:flex-none md:w-20 h-px bg-linear-to-r from-transparent via-primary/50 to-primary" />
                <h1 className="text-[clamp(1.2rem,2.5vw,2rem)] shrink-0 whitespace-nowrap font-bold text-white/90 pr-2 flex items-center gap-2">
                    <span className="text-2xl">💼</span>
                    {t("pages.profile.personalHistory.title")}
                </h1>
            </div>

            <div className="w-full space-y-4">
                {careerList.map((career, index) => (
                    <div key={index} className="relative pl-8 pb-4">
                        {/* 타임라인 라인 */}
                        <div className="absolute left-3 top-3 bottom-0 w-0.5 bg-linear-to-b from-primary via-primary/50 to-transparent" />

                        {/* 타임라인 점 */}
                        <div className="absolute left-0 top-0 flex items-center justify-center">
                            <div className="relative">
                                <div className="w-6 h-6 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center">
                                    {career.isActive && (
                                        <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                                    )}
                                </div>
                                {career.isActive && (
                                    <div className="absolute inset-0 rounded-full bg-primary/30 animate-ping" />
                                )}
                            </div>
                        </div>

                        {/* 카드 콘텐츠 */}
                        <div
                            className={[
                                "group relative overflow-hidden",
                                "rounded-xl p-4",
                                "bg-linear-to-br from-white/5 to-white/2",
                                "border border-white/10",
                                "backdrop-blur-sm",
                                "transition-all duration-300",
                                "hover:from-white/8 hover:to-white/4",
                                "hover:border-primary/30",
                                "hover:shadow-lg hover:shadow-primary/5",
                            ].join(" ")}
                        >
                            {/* 배경 효과 */}
                            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <div className="absolute -top-12 -right-12 w-40 h-40 bg-primary/10 rounded-full blur-3xl" />
                            </div>

                            <div className="relative space-y-3">
                                {/* 헤더 */}
                                <div className="flex items-start justify-between gap-4">
                                    <div className="space-y-1">
                                        <h3 className="text-base md:text-lg font-bold text-white/90">
                                            {t(career.companyKey)}
                                        </h3>
                                        <p className="text-xs md:text-sm text-primary font-medium">
                                            {career.position}
                                        </p>
                                    </div>

                                    <span className={`px-2.5 py-1 rounded-full bg-primary/10 border border-primary/30 text-[10px] md:text-xs text-primary font-semibold whitespace-nowrap ${career.isActive ? "visible" : "invisible"}`}>
                                        {t("pages.profile.personalHistory.currentlyEmployed")}
                                    </span>
                                </div>

                                {/* 기간 */}
                                <div className="flex items-center gap-2 text-xs md:text-sm text-white/70">
                                    <svg className="w-4 h-4 text-primary/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    <span>{career.period}</span>
                                </div>

                                {/* 설명 */}
                                <p className="text-xs md:text-sm text-white/60 leading-relaxed">
                                    {t(career.descriptionKey)}
                                </p>

                                {/* 하단 액센트 */}
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-linear-to-r from-transparent via-primary/0 to-transparent group-hover:via-primary/40 transition-all duration-300" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </article>
    );
};
