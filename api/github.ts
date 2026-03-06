import type { IncomingMessage, ServerResponse } from 'node:http'

type Req = IncomingMessage & { query: Record<string, string | string[]> }
type Res = ServerResponse & {
    status: (code: number) => Res
    json: (data: unknown) => void
}

const ALLOWED_PATH = /^\/repos\/[^/]+\/[^/]+(?:\/(?:branches|commits|issues|pulls))?$|^\/users\/[^/]+\/events$/

export default async function handler(req: Req, res: Res) {
    const rawPath = req.query.path
    const apiPath = Array.isArray(rawPath) ? rawPath[0] : rawPath

    if (!apiPath || !ALLOWED_PATH.test(apiPath)) {
        return res.status(400).json({ error: 'Invalid or disallowed path' })
    }

    const params = new URLSearchParams()
    for (const [key, value] of Object.entries(req.query)) {
        if (key === 'path') continue
        if (Array.isArray(value)) value.forEach((v) => params.append(key, v))
        else params.set(key, value)
    }

    const qs = params.toString()
    const url = `https://api.github.com${apiPath}${qs ? `?${qs}` : ''}`

    const token = process.env.GITHUB_TOKEN
    const headers: HeadersInit = {
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        'User-Agent': 'gh-portfolio',
    }
    if (token) headers['Authorization'] = `Bearer ${token}`

    try {
        const upstream = await fetch(url, { headers })
        const data = await upstream.json()
        res.status(upstream.status).json(data)
    } catch {
        res.status(502).json({ error: 'Upstream request failed' })
    }
}
