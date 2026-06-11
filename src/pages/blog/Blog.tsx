import { Suspense, lazy, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useSeoMeta } from "../../hooks/useSeoMeta";
import { useLocalStorage } from "../../hooks/useLocalStorage";
import { BlogListSkeleton } from "./components/BlogCardSkeleton";
import { Aside } from "../../components/aside/Aside";
import { Contents } from "../../components/contents/Contents";
import { Header } from "../../components/header/Header";
import { loadAllPosts } from "../../utils/loadAllPosts";
import { BlogCard } from "./contents/BlogCard";
import { BlogFilterBar } from "./components/BlogFilterBar";
import { useTranslation } from "react-i18next";
import {
    extractAllCategories,
    extractAllTags,
    filterPosts,
    sortPosts,
    groupPostsByTag,
    getTagCounts,
} from "../../utils/blogFilters";

const BlogGroupedView = lazy(() =>
    import("./components/BlogGroupedView").then((m) => ({ default: m.BlogGroupedView })),
);

const ALL_POSTS = loadAllPosts();

const STORAGE_KEYS = {
    SORT_ORDER: "gh-portfolio:blog-sort-order",
    VIEW_MODE:  "gh-portfolio:blog-view-mode",
} as const;

export const Blog = () => {
    const { t } = useTranslation();
    const allPosts = ALL_POSTS;
    const [searchParams, setSearchParams] = useSearchParams();

    useSeoMeta({
        title: '블로그',
        description: `웹 개발자 김건호의 기술 블로그 — 총 ${allPosts.length}개의 포스트`,
        url: '/blog',
    });

    // ── URL ↔ 필터 상태 동기화 ──────────────────────────────
    // 검색어: URL ?q= 에서 초기화
    const [searchQuery, setSearchQuery] = useState(() => searchParams.get("q") ?? "");
    const [debouncedQuery, setDebouncedQuery] = useState(() => searchParams.get("q") ?? "");

    // 태그: URL ?tags= 에서 초기화
    const [selectedTags, setSelectedTags] = useState<string[]>(() => {
        const raw = searchParams.get("tags");
        return raw ? raw.split(",").filter(Boolean) : [];
    });
    const [selectedCategory, setSelectedCategory] = useState(() => searchParams.get("category") ?? "");

    // 뷰 설정은 URL 불필요 — localStorage 유지
    const [sortOrder, setSortOrder] = useLocalStorage<"asc" | "desc">(STORAGE_KEYS.SORT_ORDER, "desc");
    const [viewMode, setViewMode] = useLocalStorage<"list" | "grouped" | "grid">(STORAGE_KEYS.VIEW_MODE, "list");

    // 상태 변경 → URL 동기화 (replace: history stack 오염 방지)
    useEffect(() => {
        setSearchParams((prev) => {
            const next = new URLSearchParams(prev);
            if (debouncedQuery) next.set("q", debouncedQuery);
            else next.delete("q");
            if (selectedTags.length > 0) next.set("tags", selectedTags.join(","));
            else next.delete("tags");
            if (selectedCategory) next.set("category", selectedCategory);
            else next.delete("category");
            return next;
        }, { replace: true });
    }, [debouncedQuery, selectedTags, selectedCategory, setSearchParams]);

    // ── 필터링 / 정렬 ────────────────────────────────────────
    const availableTags = useMemo(() => extractAllTags(allPosts), [allPosts]);
    const availableCategories = useMemo(() => extractAllCategories(allPosts), [allPosts]);
    const tagCounts = useMemo(() => getTagCounts(allPosts), [allPosts]);

    const filteredPosts = useMemo(
        () => filterPosts(allPosts, debouncedQuery, selectedTags, selectedCategory),
        [allPosts, debouncedQuery, selectedTags, selectedCategory],
    );

    const sortedPosts = useMemo(() => {
        if (debouncedQuery.trim()) return filteredPosts;
        return sortPosts(filteredPosts, sortOrder);
    }, [filteredPosts, sortOrder, debouncedQuery]);

    const groupedPosts = useMemo(
        () => (viewMode === "grouped" ? groupPostsByTag(sortedPosts) : {}),
        [sortedPosts, viewMode],
    );

    return (
        <>
            <Header />
            <Aside />
            <Contents>
                <div className="flex flex-col h-[calc(100vh-8rem)] sm:py-4 py-1 md:px-0 px-2">
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
                            selectedCategory={selectedCategory}
                            onCategoryChange={setSelectedCategory}
                            sortOrder={sortOrder}
                            onSortChange={setSortOrder}
                            viewMode={viewMode}
                            onViewModeChange={setViewMode}
                            availableTags={availableTags}
                            availableCategories={availableCategories}
                            tagCounts={tagCounts}
                            totalPosts={allPosts.length}
                            filteredCount={sortedPosts.length}
                        />
                    </div>

                    <div className="flex-1 overflow-y-auto pr-2 scrolls">
                        {allPosts.length === 0 ? (
                            <p className="text-zinc-700 dark:text-zinc-300">
                                {t("pages.blog.noPosts")}{" "}
                                {t("pages.blog.addPostsHint")}{" "}
                                <span className="font-mono">src/content/posts</span>{" "}
                                <span className="font-mono">.md</span>.
                            </p>
                        ) : sortedPosts.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
                                <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center text-2xl">
                                    🔍
                                </div>
                                <div>
                                    <p className="text-base font-medium text-zinc-300 mb-1">
                                        {t("pages.blog.noResults")}
                                    </p>
                                    <p className="text-sm text-zinc-500">
                                        {t("pages.blog.noResultsHint")}
                                    </p>
                                </div>
                                <button
                                    onClick={() => {
                                        setSearchQuery("");
                                        setDebouncedQuery("");
                                        setSelectedTags([]);
                                        setSelectedCategory("");
                                    }}
                                    className="px-4 py-2 rounded-lg text-sm font-medium bg-primary/10 border border-primary/30 text-primary hover:bg-primary/20 transition-colors"
                                >
                                    {t("pages.blog.filter.resetFilters")}
                                </button>
                            </div>
                        ) : viewMode === "list" ? (
                            <ul className="flex flex-col gap-3 pb-4">
                                {sortedPosts.map((p, i) => <BlogCard key={p.slug} p={p} searchQuery={debouncedQuery} index={i} />)}
                            </ul>
                        ) : viewMode === "grid" ? (
                            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pb-4">
                                {sortedPosts.map((p, i) => <BlogCard key={p.slug} p={p} searchQuery={debouncedQuery} index={i} />)}
                            </ul>
                        ) : (
                            <div className="pb-4">
                                <Suspense fallback={<BlogListSkeleton />}>
                                    <BlogGroupedView posts={groupedPosts} />
                                </Suspense>
                            </div>
                        )}
                    </div>
                </div>
            </Contents>
        </>
    );
};
