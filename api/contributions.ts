import type { IncomingMessage, ServerResponse } from 'node:http'

type Req = IncomingMessage & { query: Record<string, string | string[]> }
type Res = ServerResponse & {
    status: (code: number) => Res
    json: (data: unknown) => void
}

const CONTRIBUTIONS_QUERY = `
query ($login: String!, $from: DateTime!, $to: DateTime!) {
  user(login: $login) {
    contributionsCollection(from: $from, to: $to) {
      contributionCalendar {
        totalContributions
        weeks {
          contributionDays {
            date
            contributionCount
            color
          }
        }
      }
    }
  }
}
`

export default async function handler(req: Req, res: Res) {
    const get = (key: string) => {
        const v = req.query[key]
        return Array.isArray(v) ? v[0] : v
    }

    const login = get('login')
    const from = get('from')
    const to = get('to')

    if (!login || !from || !to) {
        return res.status(400).json({ error: 'login, from, to are required' })
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
            },
            body: JSON.stringify({ query: CONTRIBUTIONS_QUERY, variables: { login, from, to } }),
        })
        const data = await upstream.json()
        res.status(upstream.status).json(data)
    } catch {
        res.status(502).json({ error: 'Upstream request failed' })
    }
}
