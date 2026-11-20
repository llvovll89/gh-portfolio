// 서버리스 인스턴스 간에 공유되는 일일 호출 상한 (Firestore 카운터)
// IP별 메모리 rate limit 은 인스턴스마다 따로라서, 유료 API 비용의 최종 방어선으로 전역 상한을 둠
import type { Firestore } from 'firebase-admin/firestore'

/** UTC 기준 날짜 키 (예: 2026-11-20) */
export const quotaDay = (now: Date) => now.toISOString().slice(0, 10)

/** 오늘 사용량이 limit 미만이면 1 증가시키고 true, 이미 다 썼으면 false */
export async function consumeDailyQuota(db: Firestore, key: string, limit: number, now = new Date()): Promise<boolean> {
    const ref = db.collection('api_usage').doc(`${key}-${quotaDay(now)}`)
    return db.runTransaction(async (tx) => {
        const snap = await tx.get(ref)
        const count = (snap.get('count') as number | undefined) ?? 0
        if (count >= limit) return false
        tx.set(ref, { count: count + 1, updatedAt: now }, { merge: true })
        return true
    })
}
