import { FaGithub } from "react-icons/fa";
import { SiVelog } from "react-icons/si";
import { Link } from "react-router-dom";
import { Img } from "../../../components/Img";
import { useContext } from "react";
import { GlobalStateContext } from "../../../context/GlobalState.context";
import { convertThemeLogoColor, convertThemeTextColor } from "../../../utils/convertThemeTextColor";

interface CommonPageHeaderProps {
    title?: string;
}

export const CommonPageHeader = ({ title }: CommonPageHeaderProps) => {
    const { selectedTheme } = useContext(GlobalStateContext);

    return (
        <header className={`w-full h-10 flex items-center justify-between ${convertThemeTextColor(selectedTheme.mode)}`}>
            <div className="flex flex-col gap-0.5">
                <p className="text-md font-bold flex items-center gap-1">Geon Ho Kim <Img src="/assets/logo/GH_logo_small_white.png" className={`${convertThemeLogoColor(selectedTheme.mode)} w-5`} /> </p>
                <p className="text-xs font-semibold">Web Developer (Full Stack)</p>
            </div>

            {title && (
                <div>
                    <h3 className="text-lg font-bold underline">{title}</h3>
                </div>
            )}

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