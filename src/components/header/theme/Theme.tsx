import {useContext, useMemo, useRef} from "react";
import {GlobalStateContext} from "../../../context/GlobalState.context";
import {ThemeMode} from "../../../context/constatns/Theme.type";
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
        };
        return map;
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

    useClosePopup({
        elementRef: themeModeRef,
        callBack: close,
    });

    return (
        <div
            ref={themeModeRef}
            className="fixed right-3 bottom-3 z-[100] select-none"
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
                    "border transition-all duration-200",
                    open
                        ? "border-primary/70 ring-2 ring-primary/25"
                        : "border-white/15 hover:border-primary/50",
                    "bg-black/50 backdrop-blur-md",
                    "shadow-[0_10px_30px_rgba(2,6,23,0.22)]",
                ].join(" ")}
            >
                <img
                    src="/assets/images/icons/png/theme.png"
                    alt="테마 변경"
                    className="h-5 w-5 opacity-90 group-hover:opacity-100 transition-opacity"
                />
                <span className="pointer-events-none absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="absolute -top-6 left-1/2 h-12 w-24 -translate-x-1/2 rounded-full bg-gradient-to-r from-primary/25 via-fuchsia-400/18 to-sky-400/25 blur-2xl" />
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
                            {labelByMode[selectedTheme.mode]}
                        </p>
                    </div>

                    <div className="p-1.5">
                        {Object.values(ThemeMode).map((mode) => {
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
