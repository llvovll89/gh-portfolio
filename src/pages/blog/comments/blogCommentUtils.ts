const GRADIENTS = [
    'from-violet-500 to-purple-600',
    'from-blue-500 to-cyan-500',
    'from-emerald-500 to-teal-600',
    'from-rose-500 to-pink-600',
    'from-amber-500 to-orange-500',
    'from-indigo-500 to-blue-600',
    'from-fuchsia-500 to-violet-600',
    'from-teal-500 to-emerald-600',
]

export function getGradient(name: string): string {
    let hash = 0
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
    return GRADIENTS[Math.abs(hash) % GRADIENTS.length]
}

export function relativeTime(date: Date, language = "ko"): string {
    const minutes = Math.max(0, Math.floor((Date.now() - date.getTime()) / 60000));
    const formatter = new Intl.RelativeTimeFormat(language, { numeric: "auto" });
    if (minutes < 1) return formatter.format(0, "minute");
    if (minutes < 60) return formatter.format(-minutes, "minute");
    if (minutes < 1440) return formatter.format(-Math.floor(minutes / 60), "hour");
    if (minutes < 10080) return formatter.format(-Math.floor(minutes / 1440), "day");
    return date.toLocaleDateString(language, { year: "numeric", month: "short", day: "numeric" });
}
