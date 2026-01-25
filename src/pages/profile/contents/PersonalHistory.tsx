export const PersonalHistory = () => {
    return (
        <article className="w-full flex flex-col gap-3">
            <div className="w-full flex items-center gap-5">
                <div className="flex-1 md:flex-none md:w-100 h-px bg-white/80" />
                <h1 className="text-[clamp(1.2rem,2.5vw,3rem)] shrink-0 whitespace-nowrap font-bold text-primary pr-2">경력사항</h1>
            </div>

            <ul className="md:w-[70%] w-full flex flex-col gap-2 text-[clamp(0.8rem,2vw,1rem)] md:px-0 px-2">
                <li className="w-full flex items-center justify-between">
                    <span>2023. 07 ~</span>
                    <span>아이지아이에스 근무</span>
                </li>
            </ul>
        </article>
    );
};
