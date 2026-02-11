import { useEffect, useMemo, useState } from "react";
import { Aside } from "../../components/aside/Aside";
import { Contents } from "../../components/contents/Contents";
import { Header } from "../../components/header/Header";
import { loadPosts } from "../../utils/loadPosts";
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

const STORAGE_KEYS = {
    SORT_ORDER: "gh-portfolio:blog-sort-order",
    VIEW_MODE: "gh-portfolio:blog-view-mode",
    SELECTED_TAGS: "gh-portfolio:blog-selected-tags",
} as const;

export const Blog = () => {
    const { t } = useTranslation();
    // 전체 포스트 로드
    const allPosts = useMemo(() => loadPosts(), []);

    // 필터/검색 상태
    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedQuery, setDebouncedQuery] = useState("");
    const [selectedTags, setSelectedTags] = useState<string[]>(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEYS.SELECTED_TAGS);
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    });
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">(() => {
        const saved = localStorage.getItem(STORAGE_KEYS.SORT_ORDER);
        return saved === "asc" || saved === "desc" ? saved : "desc";
    });
    const [viewMode, setViewMode] = useState<"list" | "grouped">(() => {
        const saved = localStorage.getItem(STORAGE_KEYS.VIEW_MODE);
        return saved === "list" || saved === "grouped" ? saved : "list";
    });

    // localStorage 동기화
    useEffect(() => {
        localStorage.setItem(STORAGE_KEYS.SORT_ORDER, sortOrder);
    }, [sortOrder]);

    useEffect(() => {
        localStorage.setItem(STORAGE_KEYS.VIEW_MODE, viewMode);
    }, [viewMode]);

    useEffect(() => {
        localStorage.setItem(
            STORAGE_KEYS.SELECTED_TAGS,
            JSON.stringify(selectedTags)
        );
    }, [selectedTags]);

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
                        {allPosts.length === 0 ? (
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
