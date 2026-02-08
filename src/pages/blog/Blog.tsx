import { useEffect, useMemo, useState } from "react";
import { Aside } from "../../components/aside/Aside";
import { Contents } from "../../components/contents/Contents";
import { Header } from "../../components/header/Header";
import { CommonPageHeader } from "../common/innerHeader/CommonPageHeader";
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

    const sortedPosts = useMemo(
        () => sortPosts(filteredPosts, sortOrder),
        [filteredPosts, sortOrder]
    );

    const groupedPosts = useMemo(
        () => (viewMode === "grouped" ? groupPostsByTag(sortedPosts) : {}),
        [sortedPosts, viewMode]
    );

    return (
        <>
            <Header />
            <Aside />
            <Contents>
                <CommonPageHeader />

                <section className="py-4">
                    <div className="mb-6">
                        <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-4">
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
                        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {sortedPosts.map((p) => (
                                <BlogCard key={p.slug} p={p} />
                            ))}
                        </ul>
                    ) : (
                        <BlogGroupedView posts={groupedPosts} />
                    )}
                </section>
            </Contents>
        </>
    );
};
