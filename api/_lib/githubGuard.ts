// /api/github, /api/contributions 공용 입력 검증 (Vercel 함수 + Vite dev 미들웨어에서 공유)
// `_` 접두사 디렉토리는 Vercel이 라우트로 노출하지 않음

const SEGMENT = /^[A-Za-z0-9_.-]{1,100}$/
const REPO_SUBRESOURCES = new Set(['branches', 'commits', 'issues', 'pulls'])
const ALLOWED_PARAMS: Record<string, (value: string) => boolean> = {
    sha: (v) => /^[A-Za-z0-9._/-]{1,200}$/.test(v) && !v.split('/').includes('..'),
    state: (v) => v === 'open' || v === 'closed' || v === 'all',
    per_page: (v) => /^\d{1,3}$/.test(v) && Number(v) >= 1 && Number(v) <= 100,
    page: (v) => /^\d{1,3}$/.test(v) && Number(v) >= 1,
}

const MAX_CONTRIBUTION_RANGE_MS = 366 * 24 * 60 * 60 * 1000

function isSafeSegment(segment: string) {
    return SEGMENT.test(segment) && segment !== '.' && segment !== '..'
}

function sameOwner(a: string, allowedOwner: string | undefined) {
    // 서버에 owner가 설정돼 있으면 해당 계정만 허용
    return !allowedOwner || a.toLowerCase() === allowedOwner.toLowerCase()
}

/** 허용된 GitHub REST 경로인지 검증. 통과 시 정규화된 경로 반환, 실패 시 null */
export function validateGithubPath(rawPath: string | undefined, allowedOwner?: string): string | null {
    if (!rawPath || rawPath.length > 300 || /[%?#\\]/.test(rawPath)) return null

    const segments = rawPath.split('/')
    if (segments[0] !== '') return null
    const parts = segments.slice(1)
    if (!parts.every(isSafeSegment)) return null

    // /users/{owner}/events
    if (parts.length === 3 && parts[0] === 'users' && parts[2] === 'events') {
        return sameOwner(parts[1], allowedOwner) ? rawPath : null
    }

    // /repos/{owner}/{repo}[/{subresource}]
    if (parts[0] === 'repos' && (parts.length === 3 || parts.length === 4)) {
        if (!sameOwner(parts[1], allowedOwner)) return null
        if (parts.length === 4 && !REPO_SUBRESOURCES.has(parts[3])) return null
        return rawPath
    }

    return null
}

/** 허용된 쿼리 파라미터만 추려 반환 (알 수 없는 키·잘못된 값은 버림) */
export function pickGithubParams(entries: Iterable<[string, string]>): URLSearchParams {
    const params = new URLSearchParams()
    for (const [key, value] of entries) {
        const validate = ALLOWED_PARAMS[key]
        if (validate && validate(value)) params.set(key, value)
    }
    return params
}

export type ContributionsInput = { login: string; from: string; to: string }

/** contributions 요청 검증 — login은 서버 owner로 고정, 기간은 최대 1년 */
export function validateContributionsInput(
    input: Partial<ContributionsInput>,
    allowedOwner?: string,
): ContributionsInput | null {
    const { login, from, to } = input
    if (!login || !from || !to) return null
    if (!isSafeSegment(login) || !sameOwner(login, allowedOwner)) return null

    const fromTime = Date.parse(from)
    const toTime = Date.parse(to)
    if (Number.isNaN(fromTime) || Number.isNaN(toTime)) return null
    if (fromTime >= toTime || toTime - fromTime > MAX_CONTRIBUTION_RANGE_MS) return null

    return { login, from: new Date(fromTime).toISOString(), to: new Date(toTime).toISOString() }
}

export function getAllowedOwner(env: Record<string, string | undefined>): string | undefined {
    return env.GITHUB_OWNER || env.VITE_GIT_HUB_APP_ADMIN || undefined
}

export const GITHUB_CACHE_CONTROL = 'public, s-maxage=300, stale-while-revalidate=600'

export const CONTRIBUTIONS_QUERY = `
query ($login: String!, $from: DateTime!, $to: DateTime!) {
  user(login: $login) {
    contributionsCollection(from: $from, to: $to) {
      contributionCalendar {
        totalContributions
        weeks { contributionDays { date contributionCount color } }
      }
    }
  }
}`
