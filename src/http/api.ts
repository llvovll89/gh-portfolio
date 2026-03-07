export const GITHUB_OWNER = import.meta.env.VITE_GIT_HUB_APP_ADMIN as string

/**
 * GitHub REST API 프록시 호출 헬퍼.
 * 실제 인증 토큰은 /api/github 서버리스 함수에서 주입됩니다.
 */
export async function githubFetch(path: string, params?: Record<string, string>): Promise<unknown> {
    const qs = new URLSearchParams({ path, ...params })
    const res = await fetch(`/api/github?${qs}`)
    if (!res.ok) throw new Error(`GitHub API error: ${res.status}`)
    return res.json()
}
