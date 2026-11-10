import { cert, getApps, initializeApp } from 'firebase-admin/app'
import { getFirestore, type Firestore } from 'firebase-admin/firestore'

/**
 * 서버 전용 Firestore (보안 규칙 우회).
 * 환경변수 FIREBASE_SERVICE_ACCOUNT 에 서비스 계정 JSON 문자열을 넣어야 함.
 */
export function getAdminDb(env: Record<string, string | undefined> = process.env): Firestore | null {
    if (!getApps().length) {
        const raw = env.FIREBASE_SERVICE_ACCOUNT
        if (!raw) return null
        try {
            const account = JSON.parse(raw) as { project_id: string; client_email: string; private_key: string }
            initializeApp({
                credential: cert({
                    projectId: account.project_id,
                    clientEmail: account.client_email,
                    // Vercel 환경변수에 \n 이 이스케이프된 채로 들어오는 경우 대응
                    privateKey: account.private_key.replace(/\\n/g, '\n'),
                }),
            })
        } catch {
            return null
        }
    }
    return getFirestore()
}
