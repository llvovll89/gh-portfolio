import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'

// Firebase 설정
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

// Firebase 환경변수 누락 감지 (배포 환경 디버깅용)
if (!firebaseConfig.projectId) {
    console.error(
        '[Firebase] VITE_FIREBASE_* 환경변수가 설정되지 않았습니다. ' +
        'Vercel 대시보드 → Settings → Environment Variables를 확인해주세요.'
    )
}

// Firebase 앱 초기화
const app = initializeApp(firebaseConfig)

// Firestore 인스턴스
export const db = getFirestore(app)

export default app