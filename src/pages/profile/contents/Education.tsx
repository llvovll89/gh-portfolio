export const Education = () => {
    return (
        <article className="w-full flex flex-col gap-3">
            <div className="w-full flex items-center gap-5">
                <div className="flex-1 md:flex-none md:w-100 h-px bg-white/80" />
                <h1 className="text-[clamp(1.2rem,2.5vw,3rem)] font-bold text-primary pr-2">학력사항</h1>
            </div>

            <ul className="md:w-[70%] w-full flex flex-col gap-2 text-[clamp(0.8rem,2vw,1rem)] md:px-0 px-2">
                <li className="w-full flex items-center justify-between">
                    <span>2013. 02</span>
                    <span>대구 청구고등학교 졸업</span>
                </li>
                <li className="w-full flex items-center justify-between">
                    <span>2020. 02</span>
                    <span>대구 대학교 졸업</span>
                </li>
            </ul>
        </article>
    );
};
