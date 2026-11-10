import { initializeApp } from 'firebase/app'
import { getFirestore, type Firestore } from 'firebase/firestore'

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

// 환경변수가 없어도 정적 콘텐츠(블로그 본문 등)는 동작하도록 예외 대신 기능만 비활성화
if (missingKeys.length > 0) {
  console.warn(`[Firebase] 환경변수가 없어 조회수·댓글 기능을 비활성화합니다: ${missingKeys.join(', ')}`)
}

// Firestore 인스턴스 (미설정 시 null)
export const db: Firestore | null = missingKeys.length === 0 ? getFirestore(initializeApp(firebaseConfig)) : null