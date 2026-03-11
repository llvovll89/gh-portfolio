import { useEffect } from 'react'

const SITE_URL = 'https://kimgeonho.vercel.app'
const DEFAULT_IMAGE = `${SITE_URL}/og/thumbnail.webp`
const DEFAULT_TITLE = 'Geon Ho Kim'
const DEFAULT_DESC = '웹 개발자 김건호의 포트폴리오 및 블로그'

interface SeoMetaOptions {
    title?: string
    description?: string
    image?: string
    url?: string
    type?: 'website' | 'article'
}

function setMeta(selector: string, attr: string, value: string) {
    let el = document.querySelector<HTMLMetaElement>(selector)
    if (!el) {
        el = document.createElement('meta')
        // property or name 설정
        if (selector.includes('property=')) {
            el.setAttribute('property', selector.match(/property="([^"]+)"/)?.[1] ?? '')
        } else {
            el.setAttribute('name', selector.match(/name="([^"]+)"/)?.[1] ?? '')
        }
        document.head.appendChild(el)
    }
    el.setAttribute(attr, value)
}

export function useSeoMeta({
    title,
    description = DEFAULT_DESC,
    image = DEFAULT_IMAGE,
    url,
    type = 'website',
}: SeoMetaOptions = {}) {
    useEffect(() => {
        const fullTitle = title ? `${title} | GH Portfolio` : DEFAULT_TITLE
        const fullUrl = url ? `${SITE_URL}${url}` : SITE_URL

        // document title
        document.title = fullTitle

        // description
        setMeta('meta[name="description"]', 'content', description)

        // OG
        setMeta('meta[property="og:title"]', 'content', fullTitle)
        setMeta('meta[property="og:description"]', 'content', description)
        setMeta('meta[property="og:image"]', 'content', image)
        setMeta('meta[property="og:url"]', 'content', fullUrl)
        setMeta('meta[property="og:type"]', 'content', type)

        // Twitter
        setMeta('meta[name="twitter:title"]', 'content', fullTitle)
        setMeta('meta[name="twitter:description"]', 'content', description)
        setMeta('meta[name="twitter:image"]', 'content', image)

        // 언마운트 시 기본값 복원
        return () => {
            document.title = DEFAULT_TITLE
            setMeta('meta[name="description"]', 'content', DEFAULT_DESC)
            setMeta('meta[property="og:title"]', 'content', DEFAULT_TITLE)
            setMeta('meta[property="og:description"]', 'content', DEFAULT_DESC)
            setMeta('meta[property="og:image"]', 'content', DEFAULT_IMAGE)
            setMeta('meta[property="og:url"]', 'content', SITE_URL)
            setMeta('meta[property="og:type"]', 'content', 'website')
            setMeta('meta[name="twitter:title"]', 'content', DEFAULT_TITLE)
            setMeta('meta[name="twitter:description"]', 'content', DEFAULT_DESC)
            setMeta('meta[name="twitter:image"]', 'content', DEFAULT_IMAGE)
        }
    }, [title, description, image, url, type])
}
