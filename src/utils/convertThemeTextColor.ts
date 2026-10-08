import type { ThemeMode } from "../context/constatns/Theme.type";

// Legacy helpers now resolve through the shared palette, including custom colors.
export const convertThemeTextColor = (mode: ThemeMode): string => { void mode; return "text-foreground"; };
export const convertThemeLogoColor = (mode: ThemeMode): string => { void mode; return "fill-foreground"; };
export const getTextColorFromBg = (bgColor: string): string => { void bgColor; return "text-foreground"; };
export const getLogoColorFromBg = (bgColor: string): string => { void bgColor; return "fill-foreground"; };
