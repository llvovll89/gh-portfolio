import { createHash, randomBytes, scrypt, timingSafeEqual } from 'node:crypto'

// 과거 클라이언트 해시(SHA-256) 검증용 — 신규 저장에는 사용하지 않음
const LEGACY_APP_SALT = 'gh-portfolio-2024-secure'
const SCRYPT_KEYLEN = 32

function scryptAsync(password: string, salt: Buffer): Promise<Buffer> {
    return new Promise((resolve, reject) => {
        scrypt(password, salt, SCRYPT_KEYLEN, { N: 16384, r: 8, p: 1 }, (err, key) => {
            if (err) reject(err)
            else resolve(key)
        })
    })
}

function safeEqual(a: string, b: string) {
    const left = Buffer.from(a)
    const right = Buffer.from(b)
    return left.length === right.length && timingSafeEqual(left, right)
}

const sha256 = (input: string) => createHash('sha256').update(input).digest('hex')

/** 저장 형식: `scrypt$<salt hex>$<key hex>` */
export async function hashCommentPassword(password: string): Promise<string> {
    const salt = randomBytes(16)
    const key = await scryptAsync(password, salt)
    return `scrypt$${salt.toString('hex')}$${key.toString('hex')}`
}

/** 신규(scrypt) + 레거시(salt:sha256, 순수 sha256, 평문 fallback) 형식 모두 검증 */
export async function verifyCommentPassword(password: string, stored: string): Promise<boolean> {
    if (!password || !stored) return false

    if (stored.startsWith('scrypt$')) {
        const [, saltHex, keyHex] = stored.split('$')
        if (!saltHex || !keyHex) return false
        const key = await scryptAsync(password, Buffer.from(saltHex, 'hex'))
        return safeEqual(key.toString('hex'), keyHex)
    }

    if (/^[0-9a-f]{32}:[0-9a-f]{64}$/.test(stored)) {
        const [salt, hash] = stored.split(':')
        return safeEqual(sha256(`${LEGACY_APP_SALT}:${salt}:${password}`), hash)
    }

    if (/^[0-9a-f]{64}$/.test(stored)) {
        return safeEqual(sha256(password), stored)
    }

    // 과거 평문 저장값은 공개 문서에서 그대로 읽을 수 있으므로 비밀번호로 인정하지 않음
    return false
}
