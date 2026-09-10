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

export const Folder = () => {
    const { selectedPathState, setSelectedNav } = useContext(NavigationContext);
    const { backgroundStyle, backgroundClass } = useThemeStyle();
    const handlePushPath = useHandlePushPath();
    const { t } = useTranslation();

    return (
        <section
            className={`w-full flex flex-col ${backgroundClass} overflow-hidden`}
            style={backgroundStyle}
        >
            <header className="w-full h-10 px-3 flex items-center text-xs text-white overflow-hidden tracking-[1px]">
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
                            <li
                                onClick={() => { handlePushPath(r.path); setSelectedNav(null); }}
                                key={r.path}
                                className={`${selectedPathState.state === r.path
                                        ? "bg-sub-gary/20"
                                        : ""
                                    } w-full h-8 flex items-center px-3 text-white cursor-pointer text-xs hover:bg-primary/20 user-select-none gap-1`}
                            >
                                <Icon className={`w-4 h-4 flex-shrink-0 ${colorClass}`} />
                                <span className="truncate">{t(`routes.${r.name}`)}</span>
                            </li>
                        );
                    })}
            </ul>
        </section>
    );
};
