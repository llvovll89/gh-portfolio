import { GITHUB_CACHE_CONTROL, getAllowedOwner, pickGithubParams, validateGithubPath } from './_lib/githubGuard.js'
import type { ApiRequest, ApiResponse } from './_lib/request.js'

export default async function handler(req: ApiRequest, res: ApiResponse) {
    if (req.method !== 'GET') {
        res.setHeader('Allow', 'GET')
        return res.status(405).json({ error: 'Method not allowed' })
    }

    // owner 미설정 시 아무 계정이나 토큰으로 프록시하는 open proxy 가 되므로 차단
    const owner = getAllowedOwner(process.env)
    if (!owner) return res.status(503).json({ error: 'GitHub owner not configured on server' })

    const rawPath = req.query.path
    const apiPath = validateGithubPath(Array.isArray(rawPath) ? rawPath[0] : rawPath, owner)

    if (!apiPath) {
        return res.status(400).json({ error: 'Invalid or disallowed path' })
    }

    const entries: [string, string][] = Object.entries(req.query)
        .filter(([key]) => key !== 'path')
        .map(([key, value]) => [key, Array.isArray(value) ? value[0] : value])
    const params = pickGithubParams(entries)
    // 허용되지 않은 파라미터를 붙여 CDN 캐시를 우회하고 토큰 quota 를 소모하는 요청 차단
    if ([...params.keys()].length !== entries.length) {
        return res.status(400).json({ error: 'Invalid query parameters' })
    }
    const qs = params.toString()
    const url = `https://api.github.com${apiPath}${qs ? `?${qs}` : ''}`

    const token = process.env.GITHUB_TOKEN
    const headers: Record<string, string> = {
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        'User-Agent': 'gh-portfolio',
    }
    if (token) headers['Authorization'] = `Bearer ${token}`

    try {
        const upstream = await fetch(url, { headers, signal: AbortSignal.timeout(5000) })
        const data = await upstream.json()
        if (upstream.ok) res.setHeader('Cache-Control', GITHUB_CACHE_CONTROL)
        res.status(upstream.status).json(data)
    } catch {
        res.status(502).json({ error: 'Upstream request failed' })
    }
}
