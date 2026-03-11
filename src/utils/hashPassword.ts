// 앱 고유 고정 salt — rainbow table 공격 차단 (salt 없는 SHA-256 대비 대폭 향상)
const APP_SALT = 'gh-portfolio-2024-secure'

async function sha256(input: string): Promise<string> {
    const enc = new TextEncoder()
    const buffer = await window.crypto.subtle.digest('SHA-256', enc.encode(input))
    return Array.from(new Uint8Array(buffer))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('')
}

/**
 * 비밀번호 해싱 (저장용)
 * 형식: `{randomSalt}:{SHA-256(APP_SALT:randomSalt:password)}`
 */
export async function hashPassword(password: string): Promise<string> {
    if (typeof window === 'undefined' || !window.crypto?.subtle) return password

    // 16바이트 랜덤 salt 생성
    const saltBytes = new Uint8Array(16)
    window.crypto.getRandomValues(saltBytes)
    const salt = Array.from(saltBytes)
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('')

    const hash = await sha256(`${APP_SALT}:${salt}:${password}`)
    return `${salt}:${hash}`
}

/**
 * 비밀번호 검증
 * - 신규 형식: `salt:hash` → 랜덤 salt + APP_SALT 적용 해시
 * - 레거시 형식: 64자 hex → salt 없는 순수 SHA-256 (기존 DB 호환)
 */
export async function verifyPassword(password: string, stored: string): Promise<boolean> {
    if (typeof window === 'undefined' || !window.crypto?.subtle) {
        return stored === password
    }

    // 신규 형식: `{32자 salt}:{64자 hash}` = 97자
    const colonIdx = stored.indexOf(':')
    if (colonIdx === 32) {
        const salt = stored.slice(0, 32)
        const storedHash = stored.slice(33)
        const hash = await sha256(`${APP_SALT}:${salt}:${password}`)
        return hash === storedHash
    }

    // 레거시 형식: salt 없는 순수 SHA-256 (기존 Firestore 데이터 호환)
    const legacyHash = await sha256(password)
    return legacyHash === stored
}

export default hashPassword
