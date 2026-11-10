export function relativeTime(date: Date, language = "ko"): string {
    const minutes = Math.max(0, Math.floor((Date.now() - date.getTime()) / 60000));
    const formatter = new Intl.RelativeTimeFormat(language, { numeric: "auto" });
    if (minutes < 1) return formatter.format(0, "minute");
    if (minutes < 60) return formatter.format(-minutes, "minute");
    if (minutes < 1440) return formatter.format(-Math.floor(minutes / 60), "hour");
    if (minutes < 10080) return formatter.format(-Math.floor(minutes / 1440), "day");
    return date.toLocaleDateString(language, { year: "numeric", month: "short", day: "numeric" });
}
