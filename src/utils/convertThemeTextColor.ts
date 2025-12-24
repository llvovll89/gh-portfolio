import { returnWhiteText, type ThemeMode } from "../context/constatns/Theme.type";

export const convertThemeTextColor = (mode: ThemeMode): string => {
    return returnWhiteText.includes(mode) ? "text-white" : "text-black";
};

export const convertThemeLogoColor = (mode: ThemeMode): string => {
    return returnWhiteText.includes(mode) ? "fill-white" : "fill-black";
}