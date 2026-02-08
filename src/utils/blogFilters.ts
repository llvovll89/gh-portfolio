import type { BlogPost } from "./loadPosts";

/**
 * 모든 포스트에서 사용된 태그를 추출하고 알파벳 순으로 정렬
 */
export function extractAllTags(posts: BlogPost[]): string[] {
    const tagSet = new Set<string>();

    posts.forEach((post) => {
        post.tags?.forEach((tag) => tagSet.add(tag));
    });

    return Array.from(tagSet).sort((a, b) => a.localeCompare(b));
}

/**
 * 검색 점수 계산 (Search.tsx의 scoreRoute 패턴 참고)
 */
export function scorePost(
    post: BlogPost,
    keywords: string[],
    fullQueryLower: string
): number {
    const titleLower = post.title.toLowerCase();
    const summaryLower = (post.summary || post.body || "").toLowerCase();
    const tagsLower = (post.tags || []).map((t) => t.toLowerCase());

    let score = 0;

    // 제목 완전 일치
    if (titleLower === fullQueryLower) {
        score += 200;
    }

    // 제목 시작 일치
    if (titleLower.startsWith(fullQueryLower)) {
        score += 120;
    }

    // 제목 포함
    if (titleLower.includes(fullQueryLower)) {
        score += 50;
    }

    // 요약 포함
    if (summaryLower.includes(fullQueryLower)) {
        score += 30;
    }

    // 각 키워드별 점수 계산
    let matchedCount = 0;
    for (const keyword of keywords) {
        let matched = false;

        // 제목에서 키워드 매칭
        if (titleLower.includes(keyword)) {
            score += 20;
            matched = true;
            // 시작 위치 보너스
            if (titleLower.startsWith(keyword)) {
                score += 15;
            }
        }

        // 요약에서 키워드 매칭
        if (summaryLower.includes(keyword)) {
            score += 10;
            matched = true;
        }

        // 태그 매칭
        for (const tag of tagsLower) {
            if (tag === keyword) {
                score += 40; // 완전 일치
                matched = true;
            } else if (tag.includes(keyword)) {
                score += 20; // 부분 일치
                matched = true;
            }
        }

        if (matched) {
            matchedCount++;
        }
    }

    // 모든 키워드 매칭 보너스
    if (keywords.length > 0 && matchedCount === keywords.length) {
        score += 40;
    }

    // 짧은 제목 우대 (더 정확한 일치로 간주)
    score += Math.max(0, 20 - post.title.length * 0.5);

    return score;
}

/**
 * 검색어와 태그 필터를 적용하여 포스트 필터링
 */
export function filterPosts(
    posts: BlogPost[],
    searchQuery: string,
    selectedTags: string[]
): BlogPost[] {
    let filtered = posts;

    // 태그 필터 적용 (AND 조건: 선택한 모든 태그를 포함해야 함)
    if (selectedTags.length > 0) {
        filtered = filtered.filter((post) => {
            if (!post.tags || post.tags.length === 0) return false;
            return selectedTags.every((selectedTag) =>
                post.tags!.includes(selectedTag)
            );
        });
    }

    // 검색어 필터 적용
    if (searchQuery.trim()) {
        const fullQueryLower = searchQuery.toLowerCase().trim();
        const keywords = fullQueryLower
            .split(/\s+/)
            .filter((k) => k.length > 0);

        // 점수 기반 필터링 및 정렬
        const scored = filtered.map((post) => ({
            post,
            score: scorePost(post, keywords, fullQueryLower),
        }));

        // 점수가 0보다 큰 것만 필터링
        filtered = scored
            .filter(({ score }) => score > 0)
            .sort((a, b) => b.score - a.score) // 점수 내림차순
            .map(({ post }) => post);
    }

    return filtered;
}

/**
 * 날짜 기준으로 포스트 정렬
 */
export function sortPosts(
    posts: BlogPost[],
    order: "asc" | "desc"
): BlogPost[] {
    const sorted = [...posts];

    sorted.sort((a, b) => {
        if (order === "desc") {
            return a.date < b.date ? 1 : a.date > b.date ? -1 : 0;
        } else {
            return a.date > b.date ? 1 : a.date < b.date ? -1 : 0;
        }
    });

    return sorted;
}

/**
 * 태그별로 포스트 그룹화
 * 포스트 개수가 많은 순 → 태그명 알파벳 순으로 정렬
 */
export function groupPostsByTag(posts: BlogPost[]): Record<string, BlogPost[]> {
    const grouped: Record<string, BlogPost[]> = {};

    // 각 포스트를 해당 태그 그룹에 추가
    posts.forEach((post) => {
        if (!post.tags || post.tags.length === 0) {
            // 태그가 없는 포스트는 "미분류"로 그룹화
            if (!grouped["미분류"]) {
                grouped["미분류"] = [];
            }
            grouped["미분류"].push(post);
        } else {
            post.tags.forEach((tag) => {
                if (!grouped[tag]) {
                    grouped[tag] = [];
                }
                grouped[tag].push(post);
            });
        }
    });

    // 각 그룹 내에서 날짜 내림차순 정렬
    Object.keys(grouped).forEach((tag) => {
        grouped[tag].sort((a, b) =>
            a.date < b.date ? 1 : a.date > b.date ? -1 : 0
        );
    });

    return grouped;
}

/**
 * 그룹화된 포스트를 정렬된 배열로 변환
 * (포스트 개수 내림차순 → 태그명 알파벳 순)
 */
export function getSortedGroupEntries(
    grouped: Record<string, BlogPost[]>
): [string, BlogPost[]][] {
    return Object.entries(grouped).sort(([tagA, postsA], [tagB, postsB]) => {
        // 포스트 개수로 비교
        if (postsA.length !== postsB.length) {
            return postsB.length - postsA.length;
        }
        // 개수가 같으면 태그명 알파벳 순
        return tagA.localeCompare(tagB);
    });
}

/**
 * 각 태그별 포스트 개수 계산
 */
export function getTagCounts(posts: BlogPost[]): Record<string, number> {
    const counts: Record<string, number> = {};

    posts.forEach((post) => {
        post.tags?.forEach((tag) => {
            counts[tag] = (counts[tag] || 0) + 1;
        });
    });

    return counts;
}
