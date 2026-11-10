import type { IncomingMessage, ServerResponse } from 'node:http'
import {
    CONTRIBUTIONS_QUERY,
    GITHUB_CACHE_CONTROL,
    getAllowedOwner,
    validateContributionsInput,
} from './_lib/githubGuard.js'

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

    const get = (key: string) => {
        const v = req.query[key]
        return Array.isArray(v) ? v[0] : v
    }

    const variables = validateContributionsInput(
        { login: get('login'), from: get('from'), to: get('to') },
        getAllowedOwner(process.env),
    )

    if (!variables) {
        return res.status(400).json({ error: 'Invalid login or date range' })
    }

    const token = process.env.GITHUB_TOKEN
    if (!token) {
        return res.status(503).json({ error: 'GitHub token not configured on server' })
    }

    try {
        const upstream = await fetch('https://api.github.com/graphql', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
                'User-Agent': 'gh-portfolio',
            },
            body: JSON.stringify({ query: CONTRIBUTIONS_QUERY, variables }),
        })
        const data = await upstream.json()
        if (upstream.ok) res.setHeader('Cache-Control', GITHUB_CACHE_CONTROL)
        res.status(upstream.status).json(data)
    } catch {
        res.status(502).json({ error: 'Upstream request failed' })
    }
}
