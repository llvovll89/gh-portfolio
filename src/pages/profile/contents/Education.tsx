export const Education = () => {
    const educationList = [
        {
            date: "2013. 02",
            school: "대구 청구고등학교",
            status: "졸업",
            icon: "🎓",
        },
        {
            date: "2020. 02",
            school: "대구 대학교",
            status: "졸업",
            icon: "🏫",
        },
    ];

    return (
        <article className="w-full flex flex-col gap-4">
            <div className="w-full flex items-center gap-3 md:gap-5">
                <div className="flex-1 md:flex-none md:w-20 h-px bg-linear-to-r from-transparent via-primary/50 to-primary" />
                <h1 className="text-[clamp(1.2rem,2.5vw,2rem)] font-bold text-white/90 pr-2 flex items-center gap-2">
                    <span className="text-2xl">🎓</span>
                    학력사항
                </h1>
            </div>

            <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                {educationList.map((edu, index) => (
                    <div
                        key={index}
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
                            "hover:-translate-y-1",
                        ].join(" ")}
                    >
                        {/* 배경 그라디언트 효과 */}
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
                        </div>

                        <div className="relative flex items-start gap-4">
                            {/* 아이콘 */}
                            <div className="shrink-0 w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-xl transition-transform group-hover:scale-110">
                                {edu.icon}
                            </div>

                            {/* 내용 */}
                            <div className="flex-1 space-y-1.5">
                                <div className="flex items-center justify-between gap-2">
                                    <span className="text-xs md:text-sm font-semibold text-primary">
                                        {edu.date}
                                    </span>
                                    <span className="px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-[10px] md:text-xs text-primary font-medium">
                                        {edu.status}
                                    </span>
                                </div>
                                <h3 className="text-sm md:text-base font-bold text-white/90">
                                    {edu.school}
                                </h3>
                            </div>
                        </div>

                        {/* 하단 액센트 라인 */}
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-linear-to-r from-transparent via-primary/0 to-transparent group-hover:via-primary/50 transition-all duration-300" />
                    </div>
                ))}
            </div>
        </article>
    );
};
