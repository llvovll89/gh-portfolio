export const FALLBACK_SITE = 'https://kimgeonho.vercel.app'

// Host 헤더는 위조될 수 있으므로 사이트 출처는 환경변수(Vercel 제공 값)로만 결정
export const siteOrigin = (env: Record<string, string | undefined> = process.env) => env.SITE_URL
    ?? (env.VERCEL_ENV === 'production' || !env.VERCEL_URL ? FALLBACK_SITE : `https://${env.VERCEL_URL}`)

/** 배포된 사이트의 정적 파일을 가져옴. Preview 배포 보호(401) 등으로 실패하면 운영 사이트로 대체 */
export async function fetchSiteFile(path: string, origin = siteOrigin()): Promise<string> {
    const get = async (base: string) => {
        // 느린 응답이 함수 실행 시간을 잡아먹지 않도록 5초 제한
        const response = await fetch(`${base}${path}`, { signal: AbortSignal.timeout(5000) })
        if (!response.ok) throw new Error(`${path} ${response.status}`)
        return response.text()
    }
    try {
        return await get(origin)
    } catch (err) {
        if (origin === FALLBACK_SITE) throw err
        return get(FALLBACK_SITE)
    }
}
