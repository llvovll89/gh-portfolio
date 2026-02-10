import { useContext, useState, useEffect } from "react";
import { GlobalStateContext } from "../../../../context/GlobalState.context";
import { VscSettingsGear, VscKey, VscRefresh } from "react-icons/vsc";
import { useTranslation } from "react-i18next";
import { useKeyboardShortcuts } from "../../../../hooks/useKeyboardShortcuts";
import { KeyboardShortcutId } from "../../../../types/Keyboard.types";
import {
    formatKeyCombo,
    SHORTCUT_DESCRIPTIONS_KO,
    SHORTCUT_DESCRIPTIONS_EN,
} from "../../../../constants/keyboardConstants";

interface GeneralSettings {
    language: string;
    animationSpeed: string;
}

const SHORTCUT_IDS = [
    KeyboardShortcutId.TOGGLE_FOOTER,
    KeyboardShortcutId.TOGGLE_KEYBOARD_INFO,
    KeyboardShortcutId.TOGGLE_FOLDER,
    KeyboardShortcutId.TOGGLE_SEARCH,
    KeyboardShortcutId.TOGGLE_SIDEBAR,
    KeyboardShortcutId.TOGGLE_PANEL,
    KeyboardShortcutId.COMMAND_PALETTE,
    KeyboardShortcutId.CLI_ENTER,
    KeyboardShortcutId.ALL_CLEAR,
];

export const Settings = () => {
    const { selectedTheme } = useContext(GlobalStateContext);
    const { t, i18n } = useTranslation();
    const { shortcuts, resetShortcut, resetAllShortcuts, isCustomized } =
        useKeyboardShortcuts();
    const [activeTab, setActiveTab] = useState<"shortcuts" | "general">(
        "shortcuts",
    );
    const [generalSettings, setGeneralSettings] = useState<GeneralSettings>({
        language: "ko",
        animationSpeed: "normal",
    });

    useEffect(() => {
        const stored = localStorage.getItem("portfolio-settings");
        if (stored) {
            setGeneralSettings(JSON.parse(stored));
        }
    }, []);

    const saveSettings = (settings: GeneralSettings) => {
        localStorage.setItem("portfolio-settings", JSON.stringify(settings));
        setGeneralSettings(settings);
    };

    const handleChangeLanguage = (lang: string) => {
        saveSettings({ ...generalSettings, language: lang });
        i18n.changeLanguage(lang);
    };

    const handleChangeAnimationSpeed = (speed: string) => {
        saveSettings({ ...generalSettings, animationSpeed: speed });
    };

    const getShortcutDescription = (id: KeyboardShortcutId): string => {
        const lang = i18n.language;
        return lang === "ko"
            ? SHORTCUT_DESCRIPTIONS_KO[id]
            : SHORTCUT_DESCRIPTIONS_EN[id];
    };

    return (
        <section
            className={`w-full flex flex-col ${selectedTheme.mode} overflow-hidden`}
        >
            <header className="w-full h-10 px-3 flex items-center text-xs text-white overflow-hidden tracking-[1px]">
                {t("settings.title")}
            </header>

            <div className="w-full border-b border-sub-gary/30 flex">
                <button
                    onClick={() => setActiveTab("shortcuts")}
                    className={`flex-1 px-3 py-2 text-[10px] transition-colors ${activeTab === "shortcuts"
                        ? "bg-primary/20 text-white border-b-2 border-primary"
                        : "text-white/70 hover:bg-sub-gary/20"
                        }`}
                >
                    <VscKey className="inline w-3 h-3 mr-1" />
                    {t("settings.shortcutsTab")}
                </button>
                <button
                    onClick={() => setActiveTab("general")}
                    className={`flex-1 px-3 py-2 text-[10px] transition-colors ${activeTab === "general"
                        ? "bg-primary/20 text-white border-b-2 border-primary"
                        : "text-white/70 hover:bg-sub-gary/20"
                        }`}
                >
                    <VscSettingsGear className="inline w-3 h-3 mr-1" />
                    {t("settings.general")}
                </button>
            </div>

            <div className="w-full h-[calc(100%-80px)] overflow-y-auto">
                {activeTab === "shortcuts" ? (
                    <div className="p-3">
                        <div className="flex items-center justify-between mb-3">
                            <p className="text-[10px] text-white/70">
                                {t("settings.keyboardShortcuts")}
                            </p>
                            <button
                                onClick={resetAllShortcuts}
                                className="flex items-center gap-1 px-2 py-1 text-[10px] text-white/70 hover:text-white hover:bg-sub-gary/20 rounded transition-colors"
                                title="모두 초기화"
                            >
                                <VscRefresh className="w-3 h-3" />
                                {t("settings.resetAll") || "초기화"}
                            </button>
                        </div>
                        <ul className="space-y-2">
                            {SHORTCUT_IDS.map((id) => (
                                <li
                                    key={id}
                                    className="flex items-center justify-between p-2 bg-sub-gary/20 rounded hover:bg-sub-gary/30 transition-colors group"
                                >
                                    <span className="text-[10px] text-white/70 flex-1">
                                        {getShortcutDescription(id)}
                                    </span>
                                    <div className="flex items-center gap-2">
                                        <kbd
                                            className={`px-2 py-1 text-[10px] bg-sub-gary/40 text-white rounded border ${isCustomized(id)
                                                    ? "border-primary/50"
                                                    : "border-sub-gary/30"
                                                }`}
                                        >
                                            {formatKeyCombo(shortcuts[id])}
                                        </kbd>
                                        {isCustomized(id) && (
                                            <button
                                                onClick={() => resetShortcut(id)}
                                                className="opacity-0 group-hover:opacity-100 p-1 text-white/50 hover:text-white rounded transition-all"
                                                title="기본값으로 복원"
                                            >
                                                <VscRefresh className="w-3 h-3" />
                                            </button>
                                        )}
                                    </div>
                                </li>
                            ))}
                        </ul>
                        <p className="mt-4 text-[9px] text-white/50 italic">
                            {t("settings.shortcutsNote") ||
                                "* 단축키는 localStorage에 저장됩니다"}
                        </p>
                    </div>
                ) : (
                    <div className="p-3 space-y-4">
                        <div>
                            <label className="block text-[10px] text-white/70 mb-2">
                                {t("settings.language")}
                            </label>
                            <select
                                value={generalSettings.language}
                                onChange={(e) =>
                                    handleChangeLanguage(e.target.value)
                                }
                                className="w-full px-2 py-1.5 text-xs bg-sub-gary/20 text-white border border-sub-gary/30 rounded focus:outline-none focus:border-primary [&>option]:text-black [&>option]:bg-white"
                            >
                                <option value="ko">한국어</option>
                                <option value="en">English</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-[10px] text-white/70 mb-2">
                                {t("settings.animationSpeed")}
                            </label>
                            <select
                                value={generalSettings.animationSpeed}
                                onChange={(e) =>
                                    handleChangeAnimationSpeed(e.target.value)
                                }
                                className="w-full px-2 py-1.5 text-xs bg-sub-gary/20 text-white border border-sub-gary/30 rounded focus:outline-none focus:border-primary [&>option]:text-black [&>option]:bg-white"
                            >
                                <option value="slow">{t("settings.slow")}</option>
                                <option value="normal">{t("settings.normal")}</option>
                                <option value="fast">{t("settings.fast")}</option>
                            </select>
                        </div>

                        <div className="pt-3 border-t border-sub-gary/30">
                            <p className="text-[10px] text-white/50">
                                {t("settings.storedInLocalStorage")}
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
};
