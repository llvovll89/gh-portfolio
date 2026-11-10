// IP 기준 간이 rate limit — 서버리스 인스턴스 메모리 기반이라 최선 노력 방어 (인스턴스 간 공유되지 않음)
export function createRateLimiter(limit: number, windowMs: number) {
    const hits = new Map<string, number[]>()
    return (key: string, now = Date.now()): boolean => {
        const recent = (hits.get(key) ?? []).filter(time => now - time < windowMs)
        if (recent.length >= limit) {
            hits.set(key, recent)
            return false
        }
        recent.push(now)
        hits.set(key, recent)
        // 오래된 키 정리 (메모리 누수 방지)
        if (hits.size > 5000) {
            for (const [k, times] of hits) if (!times.some(time => now - time < windowMs)) hits.delete(k)
        }
        return true
    }
}
