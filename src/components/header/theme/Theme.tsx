import { useContext, useMemo, useRef } from "react";
import { ThemeContext } from "../../../context/ThemeContext";
import { ThemeMode, RECOMMENDED_COLORS } from "../../../context/constatns/Theme.type";
import { useClosePopup } from "../../../hooks/useClosePopup";
import { useCheckedMobileSize } from "../../../hooks/useCheckedMobileSize";

// 각 테마 모드의 실제 hex 색상값
const THEME_HEX: Record<ThemeMode, string> = {
    [ThemeMode.DARK]: "#000000",
    [ThemeMode.BASE_NAVY]: "#0c0b10",
    [ThemeMode.SUB_BLUE]: "#1e52e3",
    [ThemeMode.SUB_PINK]: "#d46876",
    [ThemeMode.SUB_GREEN]: "#43b54e",
    [ThemeMode.MAIN_TEAL]: "#009d85",
    [ThemeMode.SUB_TEAL]: "#8bc783",
    [ThemeMode.CUSTOM]: "#09f",
};

function hexToRgb(hex: string) {
    const h = hex.replace("#", "");
    const r = parseInt(h.slice(0, 2), 16);
    const g = parseInt(h.slice(2, 4), 16);
    const b = parseInt(h.slice(4, 6), 16);
    return { r, g, b };
}

function isLight(hex: string) {
    const { r, g, b } = hexToRgb(hex);
    // 밝기 계산 (YIQ)
    return (r * 299 + g * 587 + b * 114) / 1000 > 160;
}

export const Theme = () => {
    const { selectedTheme, setSelectedTheme } = useContext(ThemeContext);
    const isMobileSize = useCheckedMobileSize();

    const themeModeRef = useRef<HTMLDivElement>(null);

    const labelByMode = useMemo<Record<ThemeMode, string>>(() => ({
        [ThemeMode.SUB_GREEN]: "짙은 숲",
        [ThemeMode.DARK]: "검은배경",
        [ThemeMode.SUB_PINK]: "분홍빛",
        [ThemeMode.BASE_NAVY]: "짙은 남색",
        [ThemeMode.SUB_BLUE]: "파란하늘",
        [ThemeMode.MAIN_TEAL]: "푸른숲",
        [ThemeMode.SUB_TEAL]: "푸른 나무",
        [ThemeMode.CUSTOM]: "커스텀 색상",
    }), []);

    const presetThemes = useMemo(
        () => Object.values(ThemeMode).filter((m) => m !== ThemeMode.CUSTOM),
        [],
    );

    const open = selectedTheme.isVisibleThemeDropdown;

    const toggle = () =>
        setSelectedTheme((p) => ({ ...p, isVisibleThemeDropdown: !p.isVisibleThemeDropdown }));

    const close = () =>
        setSelectedTheme((p) => ({ ...p, isVisibleThemeDropdown: false }));

    const handleCustomColorSelect = (color: string) =>
        setSelectedTheme((p) => ({ ...p, mode: ThemeMode.CUSTOM, customColor: color }));

    useClosePopup({ elementRef: themeModeRef, callBack: close });

    // 현재 테마 색상 (커스텀이면 사용자 지정 색)
    const themeColor =
        selectedTheme.mode === ThemeMode.CUSTOM && selectedTheme.customColor
            ? selectedTheme.customColor
            : THEME_HEX[selectedTheme.mode];

    const light = isLight(themeColor);

    const currentThemeLabel =
        selectedTheme.mode === ThemeMode.CUSTOM
            ? `커스텀 (${selectedTheme.customColor || "#000000"})`
            : labelByMode[selectedTheme.mode];

    return (
        <div
            ref={themeModeRef}
            className={`fixed right-3 z-100 select-none ${isMobileSize ? "bottom-15" : "bottom-3"}`}
            style={{
                paddingBottom: "env(safe-area-inset-bottom)",
                paddingRight: "env(safe-area-inset-right)",
            }}
        >
            {/* ── 버튼 ── */}
            <button
                type="button"
                onClick={toggle}
                aria-haspopup="menu"
                aria-expanded={open}
                aria-controls="theme-menu"
                aria-label={`테마 선택 (현재: ${currentThemeLabel})`}
                className="group relative grid place-items-center h-10 w-10 rounded-xl cursor-pointer transition-all duration-300"
                style={{
                    background: `linear-gradient(135deg, ${themeColor}cc, ${themeColor}99)`,
                    border: `1.5px solid ${themeColor}${open ? "cc" : "66"}`,
                    boxShadow: open
                        ? `0 0 0 3px ${themeColor}30, 0 8px 24px ${themeColor}40`
                        : `0 4px 14px ${themeColor}30`,
                    backdropFilter: "blur(12px)",
                }}
            >
                {/* 아이콘 */}
                <img
                    src="/assets/images/icons/png/theme.png"
                    alt="테마 변경"
                    className={`h-6 w-6 transition-all duration-200 group-hover:scale-110 ${light ? "brightness-0" : "brightness-200"}`}
                />

                {/* 현재 테마 색상 표시 도트 */}
                <span
                    className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white/80 shadow"
                    style={{ background: themeColor }}
                />

                {/* hover glow */}
                <span
                    className="pointer-events-none absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ background: `radial-gradient(circle at center, ${themeColor}30, transparent 70%)` }}
                />
            </button>

            {/* ── 드롭다운 ── */}
            {open && (
                <div
                    id="theme-menu"
                    role="menu"
                    aria-label="테마 선택"
                    className="absolute right-0 bottom-full mb-3 w-48 overflow-hidden rounded-2xl shadow-2xl"
                    style={{
                        background: "rgba(15,15,20,0.92)",
                        backdropFilter: "blur(20px)",
                        border: `1px solid ${themeColor}40`,
                        boxShadow: `0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px ${themeColor}20`,
                    }}
                >
                    {/* 헤더 */}
                    <div
                        className="px-3 py-2.5 border-b"
                        style={{ borderColor: `${themeColor}25` }}
                    >
                        <p className="text-[10px] text-white/40 uppercase tracking-widest">Theme</p>
                        <div className="flex items-center gap-2 mt-0.5">
                            <span
                                className="w-3 h-3 rounded-full shrink-0 border border-white/20"
                                style={{ background: themeColor }}
                            />
                            <p className="text-sm font-semibold text-white/90 truncate">
                                {currentThemeLabel}
                            </p>
                        </div>
                    </div>

                    {/* 프리셋 목록 */}
                    <div className="p-1.5">
                        {presetThemes.map((mode) => {
                            const active = selectedTheme.mode === mode;
                            const color = THEME_HEX[mode];
                            return (
                                <button
                                    key={mode}
                                    type="button"
                                    role="menuitem"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedTheme((p) => ({
                                            ...p,
                                            mode,
                                            isVisibleThemeDropdown: false,
                                        }));
                                    }}
                                    className="w-full flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-sm transition-all cursor-pointer"
                                    style={{
                                        background: active ? `${themeColor}25` : "transparent",
                                        color: active ? "#fff" : "rgba(255,255,255,0.6)",
                                    }}
                                    onMouseEnter={(e) => {
                                        if (!active) (e.currentTarget as HTMLButtonElement).style.background = `${color}18`;
                                    }}
                                    onMouseLeave={(e) => {
                                        if (!active) (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                                    }}
                                >
                                    {/* 색상 스와치 */}
                                    <span
                                        className="w-4 h-4 rounded-full shrink-0 border border-white/20"
                                        style={{ background: color }}
                                    />
                                    <span className="flex-1 text-left truncate">{labelByMode[mode]}</span>
                                    {active && (
                                        <span
                                            className="text-[10px] font-bold px-1.5 py-0.5 rounded-md"
                                            style={{ background: `${themeColor}40`, color: "#fff" }}
                                        >
                                            ON
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {/* 커스텀 색상 */}
                    <div
                        className="p-3 border-t"
                        style={{ borderColor: `${themeColor}25` }}
                    >
                        <p className="text-[10px] text-white/40 uppercase tracking-widest mb-2">Custom</p>

                        <div className="grid grid-cols-3 gap-1.5 mb-2">
                            {RECOMMENDED_COLORS.map((color) => {
                                const isActive =
                                    selectedTheme.mode === ThemeMode.CUSTOM &&
                                    selectedTheme.customColor === color;
                                return (
                                    <button
                                        key={color}
                                        type="button"
                                        onClick={(e) => { e.stopPropagation(); handleCustomColorSelect(color); }}
                                        className="h-7 w-full rounded-lg border-2 transition-all cursor-pointer"
                                        style={{
                                            backgroundColor: color,
                                            borderColor: isActive ? "#fff" : "transparent",
                                            transform: isActive ? "scale(1.08)" : "scale(1)",
                                            boxShadow: isActive ? `0 0 8px ${color}80` : "none",
                                        }}
                                        title={color}
                                        aria-label={`색상 ${color} 선택`}
                                    />
                                );
                            })}
                        </div>

                        <input
                            type="color"
                            value={selectedTheme.customColor || "#000000"}
                            onChange={(e) => { e.stopPropagation(); handleCustomColorSelect(e.target.value); }}
                            className="sr-only"
                            id="custom-color-picker"
                        />
                        <label
                            htmlFor="custom-color-picker"
                            className="flex items-center gap-2 px-3 py-2 rounded-xl cursor-pointer transition-colors text-sm text-white/60 hover:text-white/90"
                            style={{ background: "rgba(255,255,255,0.06)" }}
                        >
                            <span>🎨</span>
                            <span>직접 선택</span>
                            {selectedTheme.mode === ThemeMode.CUSTOM && selectedTheme.customColor && (
                                <span
                                    className="ml-auto w-4 h-4 rounded-full border border-white/30 shrink-0"
                                    style={{ background: selectedTheme.customColor }}
                                />
                            )}
                        </label>
                    </div>
                </div>
            )}
        </div>
    );
};
