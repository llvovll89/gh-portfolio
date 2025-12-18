import { useContext, useRef } from "react";
import { GlobalStateContext } from "../../../context/GlobalState.context";
import { ThemeMode } from "../../../context/constatns/Theme.type";
import { useClosePopup } from "../../../hooks/useClosePopup";

export const Theme = () => {
    const { selectedTheme, setSelectedTheme } =
        useContext(GlobalStateContext);

    const themeModeRef = useRef<HTMLDivElement>(null);

    const handleChangeTheme = () => {
        setSelectedTheme((prev) => ({
            ...prev,
            isVisibleThemeDropdown: !prev.isVisibleThemeDropdown,
        }));
    };

    const convertThemeModeToLabel = (mode: ThemeMode) => {
        switch (mode) {
            case ThemeMode.SUB_GREEN:
                return "서브 그린";
            case ThemeMode.DARK:
                return "다크";
            case ThemeMode.SUB_PINK:
                return "서브 핑크";
            case ThemeMode.BASE_NAVY:
                return "기본 네이비";
            case ThemeMode.SUB_BLUE:
                return "서브 블루";
            default:
                return "";
        }
    };

    useClosePopup({
        elementRef: themeModeRef, callBack: () => {
            setSelectedTheme((prev) => ({
                ...prev,
                isVisibleThemeDropdown: false,
            }));
        }
    });

    return (
        <div ref={themeModeRef} onClick={handleChangeTheme} className={`${selectedTheme.isVisibleThemeDropdown ? "border-primary/70" : "border-sub-gary/30"} w-9 rounded-[5px] h-[85%] border flex items-center justify-center cursor-pointer relative border-l border-r ${selectedTheme.mode}`}>
            <img src="/assets/images/icons/png/theme.png" className="w-full h-full" />

            {selectedTheme.isVisibleThemeDropdown &&
                <div className="absolute top-[65%] right-4 w-30 bg-base-navy mt-1 z-1 text-xs rounded-[5px] shadow-lg">
                    {Object.values(ThemeMode).map((mode) => (
                        <span
                            key={mode}
                            className={`p-2 flex items-center cursor-pointer hover:bg-sub-gary/20 text-white ${selectedTheme.mode === mode ? "font-bold underline tracking-wide" : ""}
                                        }`}

                            onClick={() => {
                                setSelectedTheme((prev) => ({
                                    ...prev,
                                    mode: mode,
                                }));
                            }}
                        >
                            {convertThemeModeToLabel(mode)}
                        </span>
                    ))}
                </div>
            }
        </div>
    )
};