// sitemap.xml 파싱 (의존성 없는 순수 함수 — 테스트 대상)
/** sitemap.xml 에서 /blog/{slug} 주소만 골라 디코딩된 slug 집합으로 변환 */
export function parseBlogSlugs(xml: string): Set<string> {
    const slugs = new Set<string>()
    for (const match of xml.matchAll(/<loc>[^<]*?\/blog\/([^<]+)<\/loc>/g)) {
        try {
            slugs.add(decodeURIComponent(match[1]))
        } catch {
            // 잘못 인코딩된 주소는 무시
        }
    }
    return slugs
}
