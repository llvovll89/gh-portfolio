import type { BlogPost } from "./postMetadata";

const NOTES_CATEGORY = "Notes";

/**
 * 태그가 많이 겹치는 순(같은 category 는 가산점)으로 관련 글을 고름.
 * 개발 글에는 Notes(개발 외 주제)를 섞지 않고, 겹치는 태그·category 가 하나도 없으면 제외. 동점은 최신 글 우선
 */
export function getRelatedPosts(current: BlogPost, posts: BlogPost[], limit = 3): BlogPost[] {
    const currentTags = new Set((current.tags ?? []).map(tag => tag.toLowerCase()));
    const isNotes = current.category === NOTES_CATEGORY;

    return posts
        .filter(post => post.slug !== current.slug && (isNotes || post.category !== NOTES_CATEGORY))
        .map(post => {
            const sharedTags = (post.tags ?? []).filter(tag => currentTags.has(tag.toLowerCase())).length;
            const sameCategory = Boolean(current.category) && post.category === current.category;
            return { post, score: sharedTags + (sameCategory ? 0.5 : 0) };
        })
        .filter(({ score }) => score > 0)
        .sort((a, b) => b.score - a.score || b.post.date.localeCompare(a.post.date))
        .slice(0, limit)
        .map(({ post }) => post);
}
