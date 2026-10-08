import {
    BLOG_DETAIL,
    DEFAULT,
    NOT_FOUND,
    routesPath,
} from "../../../../routes/route";
import { useContext } from "react";
import { NavigationContext } from "../../../../context/NavigationContext";
import { useThemeStyle } from "../../../../hooks/useThemeStyle";
import { useHandlePushPath } from "../../../../hooks/useHandlePushPath";
import { useTranslation } from "react-i18next";
import { getFileIcon } from "../../../../constants/fileIcons";
import { useCheckedMobileSize } from "../../../../hooks/useCheckedMobileSize";

export const Folder = () => {
    const { selectedPathState, setSelectedNav } = useContext(NavigationContext);
    const { backgroundStyle, backgroundClass } = useThemeStyle();
    const handlePushPath = useHandlePushPath();
    const { t } = useTranslation();
    const isMobile = useCheckedMobileSize();

    return (
        <section
            className={`w-full flex flex-col ${backgroundClass} overflow-hidden`}
            style={backgroundStyle}
        >
            <header className="w-full h-10 px-3 flex items-center text-xs text-foreground overflow-hidden tracking-[1px]">
                {t("folder.title")}
            </header>

            <ul className="w-full h-[calc(100%-40px)]">
                {routesPath
                    .filter(
                        (r) =>
                            r.path !== NOT_FOUND &&
                            r.path !== DEFAULT &&
                            r.path !== BLOG_DETAIL,
                    )
                    .map((r) => {
                        const { Icon, colorClass } = getFileIcon(r.path);
                        return (
                            <li key={r.path}>
                                <button type="button"
                                onClick={() => { handlePushPath(r.path); if (isMobile) setSelectedNav(null); }}
                                aria-current={selectedPathState.state === r.path ? "page" : undefined}
                                className={`${selectedPathState.state === r.path
                                        ? "bg-sub-gary/20"
                                        : ""
                                    } w-full min-h-10 flex items-center px-3 text-foreground cursor-pointer text-sm hover:bg-primary/20 user-select-none gap-2 text-left`}
                            >
                                <Icon aria-hidden="true" className={`w-4 h-4 flex-shrink-0 ${colorClass}`} />
                                <span className="truncate">{t(`routes.${r.name}`)}</span>
                                </button>
                            </li>
                        );
                    })}
            </ul>
        </section>
    );
};
