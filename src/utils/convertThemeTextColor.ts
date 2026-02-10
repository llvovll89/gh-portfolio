import { returnWhiteText, type ThemeMode } from "../context/constatns/Theme.type";

export const convertThemeTextColor = (mode: ThemeMode): string => {
    return returnWhiteText.includes(mode) ? "text-white" : "text-black";
};

export const convertThemeLogoColor = (mode: ThemeMode): string => {
    return returnWhiteText.includes(mode) ? "fill-white" : "fill-black";
}

/**
 * HEX 색상을 RGB로 변환
 */
const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
};

/**
 * 상대 명도 계산 (WCAG 2.0 기준)
 */
const getRelativeLuminance = (r: number, g: number, b: number): number => {
    const [rs, gs, bs] = [r, g, b].map(c => {
        c = c / 255;
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
};

/**
 * 배경색에 따라 적절한 텍스트 색상 반환
 */
export const getTextColorFromBg = (bgColor: string): string => {
    const rgb = hexToRgb(bgColor);
    if (!rgb) return "text-white"; // 파싱 실패 시 기본값

    const luminance = getRelativeLuminance(rgb.r, rgb.g, rgb.b);
    // 밝은 배경(luminance > 0.5)이면 검은 텍스트, 어두우면 흰 텍스트
    return luminance > 0.5 ? "text-black" : "text-white";
};

/**
 * 배경색에 따라 적절한 로고 색상 반환
 */
export const getLogoColorFromBg = (bgColor: string): string => {
    const rgb = hexToRgb(bgColor);
    if (!rgb) return "fill-white"; // 파싱 실패 시 기본값

    const luminance = getRelativeLuminance(rgb.r, rgb.g, rgb.b);
    return luminance > 0.5 ? "fill-black" : "fill-white";
};