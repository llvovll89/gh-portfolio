import { useEffect, useMemo, useState } from "react";
import { useLocalStorage } from "../../hooks/useLocalStorage";
import { BlogListSkeleton } from "./components/BlogCardSkeleton";
import { Aside } from "../../components/aside/Aside";
import { Contents } from "../../components/contents/Contents";
import { Header } from "../../components/header/Header";
import { loadAllPosts } from "../../utils/loadAllPosts";
import { BlogCard } from "./contents/BlogCard";
import { BlogFilterBar } from "./components/BlogFilterBar";
import { BlogGroupedView } from "./components/BlogGroupedView";
import { useTranslation } from "react-i18next";
import {
    extractAllTags,
    filterPosts,
    sortPosts,
    groupPostsByTag,
    getTagCounts,
} from "../../utils/blogFilters";

// 빌드 타임에 결정되는 정적 데이터 — 컴포넌트 외부에서 한 번만 실행
const ALL_POSTS = loadAllPosts();

const STORAGE_KEYS = {
    SORT_ORDER: "gh-portfolio:blog-sort-order",
    VIEW_MODE: "gh-portfolio:blog-view-mode",
    SELECTED_TAGS: "gh-portfolio:blog-selected-tags",
} as const;

export const Blog = () => {
    const { t } = useTranslation();
    const allPosts = ALL_POSTS;

    // 첫 렌더 전까지 Skeleton 표시
    const [isInitialLoad, setIsInitialLoad] = useState(true);
    useEffect(() => {
        setIsInitialLoad(false);
    }, []);

    // 필터/검색 상태 (useLocalStorage로 자동 동기화)
    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedQuery, setDebouncedQuery] = useState("");
    const [selectedTags, setSelectedTags] = useLocalStorage<string[]>(STORAGE_KEYS.SELECTED_TAGS, []);
    const [sortOrder, setSortOrder] = useLocalStorage<"asc" | "desc">(STORAGE_KEYS.SORT_ORDER, "desc");
    const [viewMode, setViewMode] = useLocalStorage<"list" | "grouped" | "grid">(STORAGE_KEYS.VIEW_MODE, "list");

    // 필터링 및 정렬
    const availableTags = useMemo(
        () => extractAllTags(allPosts),
        [allPosts]
    );

    const tagCounts = useMemo(() => getTagCounts(allPosts), [allPosts]);

    const filteredPosts = useMemo(
        () => filterPosts(allPosts, debouncedQuery, selectedTags),
        [allPosts, debouncedQuery, selectedTags]
    );

    const sortedPosts = useMemo(() => {
        // 검색어가 있을 때는 이미 filterPosts에서 점수 순으로 정렬했으므로 날짜 정렬 건너뜀
        if (debouncedQuery.trim()) {
            return filteredPosts;
        }
        return sortPosts(filteredPosts, sortOrder);
    }, [filteredPosts, sortOrder, debouncedQuery]);

    const groupedPosts = useMemo(
        () => (viewMode === "grouped" ? groupPostsByTag(sortedPosts) : {}),
        [sortedPosts, viewMode]
    );

    return (
        <>
            <Header />
            <Aside />
            <Contents>
                <div className="flex flex-col h-[calc(100vh-8rem)] sm:py-4 py-1 md:px-0 px-2">
                    {/* 고정 헤더 및 필터바 */}
                    <div className="flex-none mb-6">
                        <h2 className="text-[clamp(0.85rem,1.5vw,1.25rem)] font-bold text-zinc-900 dark:text-zinc-100 mb-4">
                            {t("pages.blog.posts")}
                        </h2>

                        <BlogFilterBar
                            searchQuery={searchQuery}
                            onSearchChange={setSearchQuery}
                            onDebouncedSearchChange={setDebouncedQuery}
                            selectedTags={selectedTags}
                            onTagsChange={setSelectedTags}
                            sortOrder={sortOrder}
                            onSortChange={setSortOrder}
                            viewMode={viewMode}
                            onViewModeChange={setViewMode}
                            availableTags={availableTags}
                            tagCounts={tagCounts}
                            totalPosts={allPosts.length}
                            filteredCount={sortedPosts.length}
                        />
                    </div>

                    {/* 스크롤 가능한 포스트 리스트 영역 */}
                    <div className="flex-1 overflow-y-auto pr-2 scrolls">
                        {isInitialLoad ? (
                            <BlogListSkeleton />
                        ) : allPosts.length === 0 ? (
                            <p className="text-zinc-700 dark:text-zinc-300">
                                {t("pages.blog.noPosts")}{" "}
                                {t("pages.blog.addPostsHint")}{" "}
                                <span className="font-mono">src/content/posts</span>{" "}
                                <span className="font-mono">.md</span>.
                            </p>
                        ) : sortedPosts.length === 0 ? (
                            <div className="text-center py-12">
                                <p className="text-lg text-zinc-700 dark:text-zinc-300 mb-2">
                                    {t("pages.blog.noResults")}
                                </p>
                                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                                    {t("pages.blog.noResultsHint")}
                                </p>
                            </div>
                        ) : viewMode === "list" ? (
                            <ul className="flex flex-col gap-3 pb-4">
                                {sortedPosts.map((p) => (
                                    <BlogCard key={p.slug} p={p} />
                                ))}
                            </ul>
                        ) : viewMode === "grid" ? (
                            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pb-4">
                                {sortedPosts.map((p) => (
                                    <BlogCard key={p.slug} p={p} />
                                ))}
                            </ul>
                        ) : (
                            <div className="pb-4">
                                <BlogGroupedView posts={groupedPosts} />
                            </div>
                        )}
                    </div>
                </div>
            </Contents>
        </>
    );
};
