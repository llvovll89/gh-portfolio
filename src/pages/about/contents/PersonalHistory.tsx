export const PersonalHistory = () => {
    return (
        <article className="w-full flex flex-col gap-3">
            <div className="w-full flex items-center gap-5 mt-5">
                <div className="w-40 h-px bg-white" />
                <h1 className="text-3xl font-bold text-primary">경력사항</h1>
            </div>

            <ul className="w-[70%]">
                <li className="w-full flex items-center justify-between">
                    <span>2023. 07 ~</span>
                    <span>아이지아이에스 근무</span>
                </li>
            </ul>
        </article>
    );
};
