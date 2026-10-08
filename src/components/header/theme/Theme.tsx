import { useContext, useRef } from "react";
import { LuCheck, LuPalette } from "react-icons/lu";
import { ThemeContext } from "../../../context/ThemeContext";
import { ThemeMode, THEME_COLORS, RECOMMENDED_COLORS } from "../../../context/constatns/Theme.type";
import { useClosePopup } from "../../../hooks/useClosePopup";
import { useCheckedMobileSize } from "../../../hooks/useCheckedMobileSize";
import { useTranslation } from "react-i18next";

export const Theme = () => {
    const { selectedTheme, setSelectedTheme } = useContext(ThemeContext);
    const isMobile = useCheckedMobileSize();
    const { t } = useTranslation();
    const container = useRef<HTMLDivElement>(null);
    const open = selectedTheme.isVisibleThemeDropdown;
    const close = () => setSelectedTheme(current => ({ ...current, isVisibleThemeDropdown: false }));
    useClosePopup({ elementRef: container, callBack: close });
    const labels: Record<ThemeMode, string> = {
        [ThemeMode.SYSTEM]: t("theme.system"), [ThemeMode.LIGHT]: t("theme.light"),
        [ThemeMode.DARK]: t("theme.dark"), [ThemeMode.BASE_NAVY]: t("theme.navy"),
        [ThemeMode.SUB_BLUE]: t("theme.blue"), [ThemeMode.SUB_PINK]: t("theme.pink"),
        [ThemeMode.SUB_GREEN]: t("theme.green"), [ThemeMode.MAIN_TEAL]: t("theme.teal"),
        [ThemeMode.SUB_TEAL]: t("theme.sage"), [ThemeMode.CUSTOM]: t("theme.custom"),
    };
    const select = (mode: ThemeMode, customColor?: string) => setSelectedTheme({ mode, customColor, isVisibleThemeDropdown: false });
    return (
        <div ref={container} className={`theme-picker fixed right-3 z-100 ${isMobile ? "bottom-20" : "bottom-8"}`}
            onKeyDown={event => { if (event.key === "Escape") { close(); container.current?.querySelector("button")?.focus(); } }}>
            <button type="button" className="theme-trigger" aria-expanded={open} aria-controls={open ? "theme-options" : undefined}
                aria-label={t("theme.select", { current: labels[selectedTheme.mode] })}
                onClick={() => setSelectedTheme(current => ({ ...current, isVisibleThemeDropdown: !open }))}>
                <LuPalette aria-hidden="true" size={21} />
            </button>
            {open && <section id="theme-options" className="theme-options" aria-label={t("theme.title")}>
                <h2>{t("theme.title")}</h2>
                <div className="theme-presets">
                    {Object.values(ThemeMode).filter(mode => mode !== ThemeMode.CUSTOM).map(mode => (
                        <button key={mode} type="button" aria-pressed={selectedTheme.mode === mode} onClick={() => select(mode)}>
                            <span className="theme-swatch" style={{ background: THEME_COLORS[mode] }} aria-hidden="true" />
                            <span>{labels[mode]}</span>
                            {selectedTheme.mode === mode && <LuCheck aria-hidden="true" size={16} />}
                        </button>
                    ))}
                </div>
                <div className="theme-custom">
                    <label htmlFor="custom-color-picker">{t("theme.custom")}</label>
                    <input id="custom-color-picker" type="color" value={selectedTheme.customColor || "#181b20"}
                        onChange={event => setSelectedTheme(current => ({ ...current, mode: ThemeMode.CUSTOM, customColor: event.target.value }))} />
                </div>
                <div className="theme-colors">
                    {RECOMMENDED_COLORS.map(color => <button type="button" key={color} style={{ background: color }}
                        aria-label={t("theme.selectColor", { color })} aria-pressed={selectedTheme.mode === ThemeMode.CUSTOM && selectedTheme.customColor === color}
                        onClick={() => select(ThemeMode.CUSTOM, color)} />)}
                </div>
            </section>}
        </div>
    );
};
