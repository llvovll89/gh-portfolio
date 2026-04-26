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

export function relativeTime(date: Date): string {
    const diff = Date.now() - date.getTime()
    const min = Math.floor(diff / 60000)
    const hr = Math.floor(diff / 3600000)
    const day = Math.floor(diff / 86400000)
    if (min < 1) return '방금 전'
    if (hr < 1) return `${min}분 전`
    if (day < 1) return `${hr}시간 전`
    if (day < 7) return `${day}일 전`
    return date.toLocaleDateString('ko-KR', { year: 'numeric', month: 'short', day: 'numeric' })
}
