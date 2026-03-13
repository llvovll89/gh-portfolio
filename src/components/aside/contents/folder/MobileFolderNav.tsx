import { useContext } from "react";
import { VscRepo, VscNotebook, VscAccount, VscTools, VscComment, VscMail } from "react-icons/vsc";
import { BLOG_DETAIL, DEFAULT, NOT_FOUND, routesPath } from "../../../../routes/route";
import { NavigationContext } from "../../../../context/NavigationContext";
import { useThemeStyle } from "../../../../hooks/useThemeStyle";
import { useHandlePushPath } from "../../../../hooks/useHandlePushPath";
import { useTranslation } from "react-i18next";
import type { IconType } from "react-icons";

const ROUTE_ICONS: Record<string, IconType> = {
    "/projects": VscRepo,
    "/blog": VscNotebook,
    "/resume": VscAccount,
    "/uses": VscTools,
    "/guestbook": VscComment,
    "/contact": VscMail,
};

export const MobileFolderNav = () => {
    const { selectedPathState, setSelectedNav } = useContext(NavigationContext);
    const { backgroundStyle, backgroundClass } = useThemeStyle();
    const handlePushPath = useHandlePushPath();
    const { t } = useTranslation();

    const pages = routesPath.filter(
        (r) => r.path !== NOT_FOUND && r.path !== DEFAULT && r.path !== BLOG_DETAIL,
    );

    return (
        <nav
            className={`fixed bottom-0 left-0 right-0 z-30 ${backgroundClass} border-t border-white/10 shadow-[0_-4px_20px_rgba(0,0,0,0.4)]`}
            style={backgroundStyle}
            aria-label="페이지 탐색"
        >
            {/* 상단 인디케이터 바 */}
            <div className="flex items-center justify-between px-4 pt-2 pb-1">
                <span className="text-[10px] text-white/30 tracking-widest uppercase">Explorer</span>
                <button
                    onClick={() => setSelectedNav(null)}
                    className="text-white/30 hover:text-white/60 transition-colors text-xs px-1"
                    aria-label="탐색기 닫기"
                >
                    ✕
                </button>
            </div>

            {/* 페이지 탭 목록 */}
            <ul className="flex items-stretch px-1 pb-2">
                {pages.map((r) => {
                    const Icon = ROUTE_ICONS[r.path];
                    const isActive = selectedPathState.state === r.path;

                    return (
                        <li key={r.path} className="flex-1">
                            <button
                                onClick={() => {
                                    handlePushPath(r.path);
                                    setSelectedNav(null);
                                }}
                                className={`
                                    relative w-full flex flex-col items-center justify-center gap-1
                                    py-2 px-1 rounded-lg transition-all duration-150
                                    ${isActive
                                        ? "text-primary bg-primary/10"
                                        : "text-white/40 hover:text-white/70 hover:bg-white/5"
                                    }
                                `}
                                aria-label={t(r.name)}
                                aria-current={isActive ? "page" : undefined}
                            >
                                {/* 활성 표시 dot */}
                                {isActive && (
                                    <span className="absolute top-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
                                )}
                                {Icon && <Icon className="w-[18px] h-[18px] flex-shrink-0" />}
                                <span className="text-[9px] font-medium truncate max-w-full leading-none">
                                    {t(r.name)}
                                </span>
                            </button>
                        </li>
                    );
                })}
            </ul>
        </nav>
    );
};
