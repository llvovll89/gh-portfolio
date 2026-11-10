import type { IncomingMessage, ServerResponse } from 'node:http'
import { GITHUB_CACHE_CONTROL, getAllowedOwner, pickGithubParams, validateGithubPath } from './_lib/githubGuard.js'

type Req = IncomingMessage & { query: Record<string, string | string[]> }
type Res = ServerResponse & {
    status: (code: number) => Res
    json: (data: unknown) => void
}

export default async function handler(req: Req, res: Res) {
    if (req.method !== 'GET') {
        res.setHeader('Allow', 'GET')
        return res.status(405).json({ error: 'Method not allowed' })
    }

    const rawPath = req.query.path
    const apiPath = validateGithubPath(
        Array.isArray(rawPath) ? rawPath[0] : rawPath,
        getAllowedOwner(process.env),
    )

    if (!apiPath) {
        return res.status(400).json({ error: 'Invalid or disallowed path' })
    }

    const entries: [string, string][] = Object.entries(req.query)
        .filter(([key]) => key !== 'path')
        .map(([key, value]) => [key, Array.isArray(value) ? value[0] : value])
    const qs = pickGithubParams(entries).toString()
    const url = `https://api.github.com${apiPath}${qs ? `?${qs}` : ''}`

    const token = process.env.GITHUB_TOKEN
    const headers: Record<string, string> = {
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        'User-Agent': 'gh-portfolio',
    }
    if (token) headers['Authorization'] = `Bearer ${token}`

    try {
        const upstream = await fetch(url, { headers })
        const data = await upstream.json()
        if (upstream.ok) res.setHeader('Cache-Control', GITHUB_CACHE_CONTROL)
        res.status(upstream.status).json(data)
    } catch {
        res.status(502).json({ error: 'Upstream request failed' })
    }
}
