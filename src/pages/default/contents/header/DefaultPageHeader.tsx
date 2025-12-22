import { FaGithub } from "react-icons/fa";
import { SiVelog } from "react-icons/si";
import { Link } from "react-router-dom";

export const DefaultPageHeader = () => {
    return (
        <header className="w-full h-10 flex items-center justify-between">
            <div className="flex flex-col gap-0.5">
                <p className="text-md font-bold">Geon Ho Kim</p>
                <p className="text-xs font-semibold">Web Developer (Full Stack)</p>
            </div>

            <div className="flex items-center gap-2">
                <Link to="https://github.com/llvovll89" target="_blank" className="flex items-center gap-1 text-sm font-medium hover:underline">
                    <span>Github</span>
                    <FaGithub />
                </Link>
                <Link to="https://velog.io/@llvovll89/posts" target="_blank" className="flex items-center gap-1 text-sm font-medium hover:underline">
                    <span>Velog</span>
                    <SiVelog className="w-4 h-4" />
                </Link>
            </div>
        </header>
    )
};