export enum ThemeMode {
    SYSTEM = "system",
    LIGHT = "light",
    DARK = "bg-black",
    BASE_NAVY = "bg-base-navy",
    SUB_BLUE = "bg-sub-blue",
    SUB_PINK = "bg-sub-pink",
    SUB_GREEN = "bg-sub-green",
    MAIN_TEAL = "bg-main-teal",
    SUB_TEAL = "bg-sub-teal",
    CUSTOM = "bg-custom",
}

export const THEME_COLORS: Record<ThemeMode, string> = {
    [ThemeMode.SYSTEM]: "#181b20",
    [ThemeMode.LIGHT]: "#f3f6fa",
    [ThemeMode.DARK]: "#10151d",
    [ThemeMode.BASE_NAVY]: "#181b20",
    [ThemeMode.SUB_BLUE]: "#1e52e3",
    [ThemeMode.SUB_PINK]: "#d46876",
    [ThemeMode.SUB_GREEN]: "#43b54e",
    [ThemeMode.MAIN_TEAL]: "#009d85",
    [ThemeMode.SUB_TEAL]: "#8bc783",
    [ThemeMode.CUSTOM]: "#181b20",
};

export const returnWhiteText = [
    ThemeMode.DARK,
    ThemeMode.SUB_GREEN,
    ThemeMode.SUB_BLUE,
    ThemeMode.SUB_PINK,
    ThemeMode.BASE_NAVY,
    ThemeMode.MAIN_TEAL,
    ThemeMode.SUB_TEAL,
];

export const RECOMMENDED_COLORS = [
    "#1e3a8a", // 진한 파란색
    "#831843", // 진한 자주색
    "#166534", // 진한 초록색
    "#92400e", // 진한 갈색
    "#4c1d95", // 진한 보라색
    "#0f766e", // 진한 청록색
];
