export const Skills = () => {
    return (
        <article className="w-full flex flex-col gap-2">
            <div className="flex items-center gap-5 mt-5">
                <div className="w-80 h-px bg-white" />
                <h1 className="text-3xl font-bold text-primary">Skills</h1>
            </div>

            <ul className="w-full flex items-center gap-4">
                <li>
                    <span>JS</span>
                </li>
                <li>
                    <span>React</span>
                </li>
                <li>
                    <span>TypeScript</span>
                </li>
            </ul>
        </article>
    );
};
