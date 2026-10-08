import { ThemeMode, THEME_COLORS } from "../context/constatns/Theme.type";

const rgb = (hex: string) => [1, 3, 5].map(offset => parseInt(hex.slice(offset, offset + 2), 16));
const validHex = (hex?: string): hex is string => !!hex && /^#[\da-f]{6}$/i.test(hex);

export const luminance = (hex: string) => {
    const values = rgb(hex).map(value => {
        const channel = value / 255;
        return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
    });
    return values[0] * 0.2126 + values[1] * 0.7152 + values[2] * 0.0722;
};

export const contrast = (first: string, second: string) => {
    const values = [luminance(first), luminance(second)].sort((a, b) => b - a);
    return (values[0] + 0.05) / (values[1] + 0.05);
};

const mix = (base: string, target: string, amount: number) => {
    const targetRgb = rgb(target);
    return `#${rgb(base).map((value, index) => Math.round(value + (targetRgb[index] - value) * amount).toString(16).padStart(2, "0")).join("")}`;
};

/** Preserve custom hues, nudging borderline backgrounds until all text meets AA. */
export function getThemePalette(mode: ThemeMode, customColor?: string, systemDark = false) {
    let surface = mode === ThemeMode.SYSTEM
        ? THEME_COLORS[systemDark ? ThemeMode.BASE_NAVY : ThemeMode.LIGHT]
        : mode === ThemeMode.CUSTOM && validHex(customColor) ? customColor : THEME_COLORS[mode];
    const dark = contrast(surface, "#f3f6fa") > contrast(surface, "#10151d");
    const text = dark ? "#f3f6fa" : "#10151d";
    const inverse = dark ? "#10151d" : "#f3f6fa";
    for (let step = 0; step < 20 && contrast(mix(surface, text, dark ? 0.045 : 0.025), text) < 5; step++) {
        surface = mix(surface, inverse, 0.08);
    }
    const panel = mix(surface, text, dark ? 0.045 : 0.025);
    const inset = mix(surface, dark ? "#10151d" : "#f3f6fa", 0.35);
    const backgrounds = [surface, panel, inset];
    const readable = (candidate: string, minimum: number) => {
        let color = candidate;
        for (let step = 0; step < 20 && backgrounds.some(background => contrast(color, background) < minimum); step++) {
            color = mix(color, text, 0.18);
        }
        return color;
    };
    const accent = readable(dark ? "#75b8e8" : "#17659a", 4.5);
    const onAccent = contrast(accent, "#10151d") >= contrast(accent, "#f3f6fa") ? "#10151d" : "#f3f6fa";
    return {
        dark,
        variables: {
            "--surface": surface,
            "--surface-panel": panel,
            "--surface-inset": inset,
            "--text-primary": text,
            "--text-muted": readable(mix(surface, text, 0.68), 4.5),
            "--text-inverse": dark ? "#10151d" : "#f3f6fa",
            "--line": mix(surface, text, 0.22),
            "--input-line": readable(mix(surface, text, 0.48), 3),
            "--accent": accent,
            "--on-accent": onAccent,
            "--error": readable(dark ? "#fda4af" : "#a21d38", 4.5),
            "--success": readable(dark ? "#86d9ad" : "#216b44", 4.5),
            "--workbench-muted": readable(mix(surface, text, 0.68), 4.5),
            "--workbench-line": mix(surface, text, 0.22),
        },
    };
}
