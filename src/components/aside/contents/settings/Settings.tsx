import { uiText } from "../../../../utils/uiText";
import { useState } from "react";
import { useThemeStyle } from "../../../../hooks/useThemeStyle";
import { updateGeneralSettings, useGeneralSettings } from "../../../../utils/generalSettings";
import { VscSettingsGear, VscKey, VscRefresh } from "react-icons/vsc";
import { useTranslation } from "react-i18next";
import { useKeyboardShortcuts } from "../../../../hooks/useKeyboardShortcuts";
import { ShortcutRow } from "./ShortcutRow";
import { KeyboardShortcutId } from "../../../../types/Keyboard.types";
import {
    SHORTCUT_DESCRIPTIONS_KO,
    SHORTCUT_DESCRIPTIONS_EN,
    SHORTCUT_DESCRIPTIONS_JA,
} from "../../../../constants/keyboardConstants";


const SHORTCUT_IDS = [
    KeyboardShortcutId.TOGGLE_FOOTER,
    KeyboardShortcutId.TOGGLE_KEYBOARD_INFO,
    KeyboardShortcutId.TOGGLE_FOLDER,
    KeyboardShortcutId.TOGGLE_SEARCH,
    KeyboardShortcutId.TOGGLE_GIT_CONTROL,
    KeyboardShortcutId.TOGGLE_BOOKMARKS,
    KeyboardShortcutId.TOGGLE_SETTINGS,
    KeyboardShortcutId.TOGGLE_SIDEBAR,
    KeyboardShortcutId.TOGGLE_PANEL,
    KeyboardShortcutId.COMMAND_PALETTE,
    KeyboardShortcutId.CLI_ENTER,
    KeyboardShortcutId.ALL_CLEAR,
];

export const Settings = () => {
    const { backgroundStyle, backgroundClass } = useThemeStyle();
    const { t, i18n } = useTranslation();
    const { shortcuts, updateShortcut, resetShortcut, resetAllShortcuts, isCustomized } =
        useKeyboardShortcuts();
    const [activeTab, setActiveTab] = useState<"shortcuts" | "general">(
        "shortcuts",
    );
    // 헤더 언어 버튼·커맨드 팔레트에서 바꾼 값도 즉시 반영되도록 저장소를 구독 (자체 state 사본으로 덮어쓰지 않음)
    const generalSettings = useGeneralSettings();

    const handleChangeLanguage = (lang: string) => {
        updateGeneralSettings({ language: lang });
        void i18n.changeLanguage(lang);
    };

    const handleChangeAnimationSpeed = (speed: string) => {
        updateGeneralSettings({ animationSpeed: speed });
    };

    const getShortcutDescription = (id: KeyboardShortcutId): string => {
        const lang = i18n.language;
        if (lang === "ko") return SHORTCUT_DESCRIPTIONS_KO[id];
        if (lang === "ja") return SHORTCUT_DESCRIPTIONS_JA[id];
        return SHORTCUT_DESCRIPTIONS_EN[id];
    };

    return (
        <section
            className={`w-full flex flex-col ${backgroundClass} overflow-hidden`}
            style={backgroundStyle}
        >
            <header className="w-full h-10 px-3 flex items-center text-xs text-foreground overflow-hidden tracking-[1px]">
                {t("settings.title")}
            </header>

            <div className="w-full border-b border-sub-gary/30 flex">
                <button
                    onClick={() => setActiveTab("shortcuts")}
                    className={`flex-1 px-3 py-2 text-2xs transition-colors ${activeTab === "shortcuts"
                        ? "bg-primary/20 text-foreground border-b-2 border-primary"
                        : "text-muted hover:bg-sub-gary/20"
                        }`}
                >
                    <VscKey className="inline w-3 h-3 mr-1" />
                    {t("settings.shortcutsTab")}
                </button>
                <button
                    onClick={() => setActiveTab("general")}
                    className={`flex-1 px-3 py-2 text-2xs transition-colors ${activeTab === "general"
                        ? "bg-primary/20 text-foreground border-b-2 border-primary"
                        : "text-muted hover:bg-sub-gary/20"
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
                            <p className="text-2xs text-muted">
                                {t("settings.keyboardShortcuts")}
                            </p>
                            <button
                                onClick={resetAllShortcuts}
                                className="flex items-center gap-1 px-2 py-1 text-2xs text-muted hover:text-foreground hover:bg-sub-gary/20 rounded transition-colors"
                                title={uiText("모두 초기화")}
                            >
                                <VscRefresh className="w-3 h-3" />
                                {t("settings.resetAll") || uiText("초기화")}
                            </button>
                        </div>
                        <ul className="space-y-2">
                            {SHORTCUT_IDS.map((id) => (
                                <ShortcutRow
                                    key={id}
                                    label={getShortcutDescription(id)}
                                    combo={shortcuts[id]}
                                    customized={isCustomized(id)}
                                    // '모든 UI 닫기'는 Esc 두 번으로 동작하고 Esc 는 녹화 취소 키라 편집 대상에서 제외
                                    editable={id !== KeyboardShortcutId.ALL_CLEAR}
                                    onSave={(combo) => updateShortcut(id, combo)}
                                    onReset={() => resetShortcut(id)}
                                    describe={(otherId) => getShortcutDescription(otherId as KeyboardShortcutId)}
                                />
                            ))}
                        </ul>
                        <p className="mt-4 text-2xs text-muted italic">
                            {t("settings.shortcutsNote") ||
                                uiText("* 단축키는 localStorage에 저장됩니다")}
                        </p>
                    </div>
                ) : (
                    <div className="p-3 space-y-4">
                        <div>
                            <label className="block text-2xs text-muted mb-2">
                                {t("settings.language")}
                            </label>
                            <select
                                value={i18n.language.slice(0, 2)}
                                onChange={(e) =>
                                    handleChangeLanguage(e.target.value)
                                }
                                className="w-full px-2 py-1.5 text-xs bg-sub-gary/20 text-foreground border border-sub-gary/30 rounded focus:outline-none focus:border-primary [&>option]:text-foreground [&>option]:bg-panel"
                            >
                                <option value="ko">{uiText("한국어")}</option>
                                <option value="en">English</option>
                                <option value="ja">日本語</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-2xs text-muted mb-2">
                                {t("settings.animationSpeed")}
                            </label>
                            <select
                                value={generalSettings.animationSpeed}
                                onChange={(e) =>
                                    handleChangeAnimationSpeed(e.target.value)
                                }
                                className="w-full px-2 py-1.5 text-xs bg-sub-gary/20 text-foreground border border-sub-gary/30 rounded focus:outline-none focus:border-primary [&>option]:text-foreground [&>option]:bg-panel"
                            >
                                <option value="slow">{t("settings.slow")}</option>
                                <option value="normal">{t("settings.normal")}</option>
                                <option value="fast">{t("settings.fast")}</option>
                            </select>
                        </div>

                        <div className="pt-3 border-t border-sub-gary/30">
                            <p className="text-2xs text-muted">
                                {t("settings.storedInLocalStorage")}
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
};
