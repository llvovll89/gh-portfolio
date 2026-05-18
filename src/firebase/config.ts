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

const REQUIRED_FIREBASE_ENV_KEYS = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID',
] as const

const missingKeys = REQUIRED_FIREBASE_ENV_KEYS.filter((key) => {
  const value = import.meta.env[key]
  return typeof value !== 'string' || !value.trim()
})

if (missingKeys.length > 0) {
  throw new Error(
    `[Firebase] 필수 환경변수가 누락되었습니다: ${missingKeys.join(', ')}`,
  )
}

// Firebase 앱 초기화
const app = initializeApp(firebaseConfig)

// Firestore 인스턴스
export const db = getFirestore(app)

export default app