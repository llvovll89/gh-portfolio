export const Education = () => {
    return (
        <article className="w-full flex flex-col gap-3">
            <div className="w-full flex items-center gap-5 mt-5">
                <div className="w-60 h-px bg-white" />
                <h1 className="text-3xl font-bold text-primary">학력사항</h1>
            </div>

            <ul className="w-[70%]">
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
