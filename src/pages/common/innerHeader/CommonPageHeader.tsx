import { FaGithub } from "react-icons/fa";
import { SiVelog } from "react-icons/si";
import { HiHome } from "react-icons/hi";
import { Link } from "react-router-dom";
import { Img } from "../../../components/Img";
import { useContext } from "react";
import { GlobalStateContext } from "../../../context/GlobalState.context";
import {
    convertThemeLogoColor,
    convertThemeTextColor,
    getTextColorFromBg,
    getLogoColorFromBg,
} from "../../../utils/convertThemeTextColor";
import { ThemeMode } from "../../../context/constatns/Theme.type";

interface CommonPageHeaderProps {
    title?: string;
}

export const CommonPageHeader = ({ title }: CommonPageHeaderProps) => {
    const { selectedTheme } = useContext(GlobalStateContext);

    // 커스텀 테마 적용
    const backgroundStyle = selectedTheme.mode === ThemeMode.CUSTOM && selectedTheme.customColor
        ? { backgroundColor: selectedTheme.customColor }
        : {};

    const backgroundClass = selectedTheme.mode === ThemeMode.CUSTOM
        ? ""
        : selectedTheme.mode;

    const textColor = selectedTheme.mode === ThemeMode.CUSTOM && selectedTheme.customColor
        ? getTextColorFromBg(selectedTheme.customColor)
        : convertThemeTextColor(selectedTheme.mode);

    const logoColor = selectedTheme.mode === ThemeMode.CUSTOM && selectedTheme.customColor
        ? getLogoColorFromBg(selectedTheme.customColor)
        : convertThemeLogoColor(selectedTheme.mode);

    return (
        <header
            className={`
                w-full sm:h-14 h-12 flex items-center justify-between px-4
                ${backgroundClass} ${textColor}
                border-b border-sub-gary/30
                bg-sub-navy/20
                pb-2
            `}
            style={backgroundStyle}
        >
            {/* Left Section - Home & Profile */}
            <div className="flex items-center gap-4">
                <Link
                    to="/"
                    className="flex items-center justify-center p-2 rounded-md
                        hover:bg-sub-gary/20 transition-all duration-200
                        group"
                    aria-label="홈으로 이동"
                >
                    <HiHome className="w-5 h-5 group-hover:scale-110 transition-transform" />
                </Link>

                <div className="flex flex-col gap-0.5">
                    <p className="text-[clamp(0.85rem,1.5vw,1.1rem)] font-bold flex items-center gap-1.5">
                        Geon Ho Kim
                        <Img
                            src="/assets/logo/GH_logo_small_white.png"
                            className={`${logoColor} w-4 h-4`}
                        />
                    </p>
                    <p className="text-[clamp(0.7rem,1.2vw,0.85rem)] font-medium opacity-70">
                        Web Developer (Full Stack)
                    </p>
                </div>
            </div>

            {/* Center Section - Title */}
            {title && (
                <div className="hidden md:block">
                    <h3 className="text-[clamp(0.95rem,1.5vw,1.15rem)] font-semibold px-4 py-1
                        rounded-md bg-primary/10 border border-primary/30">
                        {title}
                    </h3>
                </div>
            )}

            {/* Right Section - Social Links */}
            <div className="flex items-center gap-3">
                <Link
                    to="https://github.com/llvovll89"
                    target="_blank"
                    className="flex items-center justify-center p-2 rounded-md
                        hover:bg-sub-gary/20 transition-all duration-200
                        group"
                    aria-label="GitHub"
                >
                    <FaGithub className="w-5 h-5 group-hover:scale-110 transition-transform" />
                </Link>
                <Link
                    to="https://velog.io/@llvovll89/posts"
                    target="_blank"
                    className="flex items-center justify-center p-2 rounded-md
                        hover:bg-sub-gary/20 transition-all duration-200
                        group"
                    aria-label="Velog"
                >
                    <SiVelog className="w-5 h-5 group-hover:scale-110 transition-transform" />
                </Link>
            </div>
        </header>
    );
};
