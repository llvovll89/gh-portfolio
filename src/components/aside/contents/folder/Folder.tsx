import { FcOpenedFolder } from "react-icons/fc";
import {
    BLOG_DETAIL,
    DEFAULT,
    NOT_FOUND,
    routesPath,
} from "../../../../routes/route";
import { useContext } from "react";
import { GlobalStateContext } from "../../../../context/GlobalState.context";
import { useHandlePushPath } from "../../../../hooks/useHandlePushPath";
import { useTranslation } from "react-i18next";
import { ThemeMode } from "../../../../context/constatns/Theme.type";

export const Folder = () => {
    const { selectedPathState, selectedTheme } = useContext(GlobalStateContext);
    const handlePushPath = useHandlePushPath();
    const { t } = useTranslation();

    // 커스텀 테마 적용
    const backgroundStyle = selectedTheme.mode === ThemeMode.CUSTOM && selectedTheme.customColor
        ? { backgroundColor: selectedTheme.customColor }
        : {};

    const backgroundClass = selectedTheme.mode === ThemeMode.CUSTOM
        ? ""
        : selectedTheme.mode;

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
                    .map((r) => (
                        <li
                            onClick={() => handlePushPath(r.path)}
                            key={r.path}
                            className={`${selectedPathState.state === r.path
                                    ? "bg-sub-gary/20"
                                    : ""
                                } w-full h-8 flex items-center px-3 text-white cursor-pointer text-xs hover:bg-primary/20 user-select-none gap-1`}
                        >
                            <FcOpenedFolder className="w-5 h-5 flex-shrink-0" />
                            <span className="truncate">{t(r.name)}</span>
                        </li>
                    ))}
            </ul>
        </section>
    );
};
