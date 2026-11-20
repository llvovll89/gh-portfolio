// 실제로 배포된 블로그 글 slug 목록 (빌드가 만든 sitemap.xml 기준)
// 형식만 맞는 임의 slug 로 blog_comments/{slug} 컬렉션이 무한히 생기는 것을 막기 위해 사용
import { parseBlogSlugs } from './sitemap.js'
import { fetchSiteFile } from './site.js'

const TTL_MS = 10 * 60 * 1000
let cache: { slugs: Set<string>; fetchedAt: number } | null = null

/**
 * true: 존재하는 글, false: 없는 글, null: sitemap 을 읽지 못해 확인 불가
 * (확인 불가일 때 댓글 작성을 막으면 사이트 장애가 댓글 장애로 번지므로 호출부에서 형식 검증만으로 허용)
 */
export async function isKnownPostSlug(slug: string): Promise<boolean | null> {
    if (!cache || Date.now() - cache.fetchedAt >= TTL_MS) {
        try {
            cache = { slugs: parseBlogSlugs(await fetchSiteFile('/sitemap.xml')), fetchedAt: Date.now() }
        } catch (err) {
            console.error('[postSlugs] sitemap.xml 을 읽지 못했습니다', err)
            return null
        }
    }
    return cache.slugs.has(slug)
}
