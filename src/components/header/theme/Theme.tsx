import {useContext, useMemo, useRef} from "react";
import {GlobalStateContext} from "../../../context/GlobalState.context";
import {ThemeMode, RECOMMENDED_COLORS} from "../../../context/constatns/Theme.type";
import {useClosePopup} from "../../../hooks/useClosePopup";

export const Theme = () => {
    const {selectedTheme, setSelectedTheme} = useContext(GlobalStateContext);

    const themeModeRef = useRef<HTMLDivElement>(null);

    const labelByMode = useMemo(() => {
        const map: Record<ThemeMode, string> = {
            [ThemeMode.SUB_GREEN]: "짙은 숲",
            [ThemeMode.DARK]: "검은배경",
            [ThemeMode.SUB_PINK]: "분홍빛",
            [ThemeMode.BASE_NAVY]: "짙은 남색",
            [ThemeMode.SUB_BLUE]: "파란하늘",
            [ThemeMode.MAIN_TEAL]: "푸른숲",
            [ThemeMode.SUB_TEAL]: "푸른 나무",
            [ThemeMode.CUSTOM]: "커스텀 색상",
        };
        return map;
    }, []);

    // 프리셋 테마만 (CUSTOM 제외)
    const presetThemes = useMemo(() => {
        return Object.values(ThemeMode).filter(mode => mode !== ThemeMode.CUSTOM);
    }, []);

    const open = selectedTheme.isVisibleThemeDropdown;

    const toggle = () => {
        setSelectedTheme((prev) => ({
            ...prev,
            isVisibleThemeDropdown: !prev.isVisibleThemeDropdown,
        }));
    };

    const close = () => {
        setSelectedTheme((prev) => ({
            ...prev,
            isVisibleThemeDropdown: false,
        }));
    };

    const handleCustomColorSelect = (color: string) => {
        setSelectedTheme((prev) => ({
            ...prev,
            mode: ThemeMode.CUSTOM,
            customColor: color,
        }));
    };

    useClosePopup({
        elementRef: themeModeRef,
        callBack: close,
    });

    const currentThemeLabel = selectedTheme.mode === ThemeMode.CUSTOM
        ? `커스텀 (${selectedTheme.customColor || '#000000'})`
        : labelByMode[selectedTheme.mode];

    return (
        <div
            ref={themeModeRef}
            className="fixed right-3 bottom-3 z-100 select-none"
            style={{
                paddingBottom: "env(safe-area-inset-bottom)",
                paddingRight: "env(safe-area-inset-right)",
            }}
        >
            <button
                type="button"
                onClick={toggle}
                aria-haspopup="menu"
                aria-expanded={open}
                className={[
                    "group relative grid place-items-center",
                    "h-10 w-10 rounded-xl",
                    "border transition-all duration-200 cursor-pointer",
                    open
                        ? "border-primary/70 ring-2 ring-primary/25"
                        : "border-white/15 hover:border-primary/50",
                    "bg-black/80 backdrop-blur-md",
                    "shadow-[0_10px_30px_rgba(2,6,23,0.22)]",
                ].join(" ")}
            >
                <img
                    src="/assets/images/icons/png/theme.png"
                    alt="테마 변경"
                    className="h-7 w-7 opacity-90 group-hover:opacity-100 transition-opacity"
                />
                <span className="pointer-events-none absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="absolute -top-6 left-1/2 h-12 w-24 -translate-x-1/2 rounded-full bg-linear-to-r from-primary/25 via-fuchsia-400/18 to-sky-400/25 blur-2xl" />
                </span>
            </button>

            {open && (
                <div
                    role="menu"
                    aria-label="테마 선택"
                    className={[
                        "absolute right-0 bottom-full mb-2 w-44 overflow-hidden rounded-2xl",
                        "border border-white/12 bg-white/90 text-slate-900",
                        "backdrop-blur-md",
                        "shadow-[0_22px_70px_rgba(2,6,23,0.25)]",
                        "origin-bottom-right",
                    ].join(" ")}
                >
                    <div className="px-3 py-2 border-b border-slate-200/70">
                        <p className="text-xs text-slate-500">Theme</p>
                        <p className="text-sm font-semibold tracking-tight">
                            {currentThemeLabel}
                        </p>
                    </div>

                    {/* 프리셋 테마 */}
                    <div className="p-1.5">
                        {presetThemes.map((mode) => {
                            const active = selectedTheme.mode === mode;

                            return (
                                <button
                                    key={mode}
                                    type="button"
                                    role="menuitem"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedTheme((prev) => ({
                                            ...prev,
                                            mode,
                                            isVisibleThemeDropdown: false,
                                        }));
                                    }}
                                    className={[
                                        "w-full text-left",
                                        "flex items-center justify-between gap-2",
                                        "rounded-xl px-3 py-2",
                                        "text-sm transition-colors",
                                        active
                                            ? "bg-primary text-white"
                                            : "hover:bg-slate-100 text-slate-800",
                                    ].join(" ")}
                                >
                                    <span className="truncate">
                                        {labelByMode[mode]}
                                    </span>
                                    {active && (
                                        <span className="text-xs font-semibold">
                                            ON
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {/* 구분선 */}
                    <div className="border-t border-slate-200/70" />

                    {/* 커스텀 색상 섹션 */}
                    <div className="p-3">
                        <p className="text-xs font-semibold text-slate-700 mb-2">
                            커스텀 색상
                        </p>

                        {/* 추천 팔레트 */}
                        <div className="grid grid-cols-3 gap-2 mb-2">
                            {RECOMMENDED_COLORS.map((color) => {
                                const isActive =
                                    selectedTheme.mode === ThemeMode.CUSTOM &&
                                    selectedTheme.customColor === color;

                                return (
                                    <button
                                        key={color}
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleCustomColorSelect(color);
                                        }}
                                        className={[
                                            "h-8 w-full rounded-lg",
                                            "border-2 transition-all",
                                            isActive
                                                ? "border-primary shadow-md scale-105"
                                                : "border-transparent hover:border-slate-300",
                                        ].join(" ")}
                                        style={{ backgroundColor: color }}
                                        title={color}
                                        aria-label={`색상 ${color} 선택`}
                                    />
                                );
                            })}
                        </div>

                        {/* 컬러 피커 */}
                        <div className="relative">
                            <input
                                type="color"
                                value={selectedTheme.customColor || "#000000"}
                                onChange={(e) => {
                                    e.stopPropagation();
                                    handleCustomColorSelect(e.target.value);
                                }}
                                className="sr-only"
                                id="custom-color-picker"
                            />
                            <label
                                htmlFor="custom-color-picker"
                                className={[
                                    "flex items-center gap-2 px-3 py-2",
                                    "rounded-xl cursor-pointer",
                                    "bg-slate-100 hover:bg-slate-200",
                                    "text-sm text-slate-700",
                                    "transition-colors",
                                ].join(" ")}
                            >
                                <span className="text-lg">🎨</span>
                                <span>원하는 색상 선택</span>
                            </label>
                        </div>
                    </div>

                    <div className="px-3 py-2 border-t border-slate-200/70">
                        <p className="text-[11px] text-slate-500">
                            바깥 클릭 시 닫혀요
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};
