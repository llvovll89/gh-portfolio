import { BlogSearchInput } from "./BlogSearchInput";
import { BlogTagFilter } from "./BlogTagFilter";
import { BlogCategoryFilter } from "./BlogCategoryFilter";
import { BlogSortToggle } from "./BlogSortToggle";
import { BlogViewToggle } from "./BlogViewToggle";
import { LuSlidersHorizontal, LuX } from "react-icons/lu";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { useCheckedMobileSize } from "../../../hooks/useCheckedMobileSize";

interface BlogFilterBarProps {
    searchQuery: string;
    onSearchChange: (query: string) => void;
    onDebouncedSearchChange: (query: string) => void;
    selectedTags: string[];
    onTagsChange: (tags: string[]) => void;
    selectedCategory: string;
    onCategoryChange: (category: string) => void;
    sortOrder: "asc" | "desc";
    onSortChange: (order: "asc" | "desc") => void;
    viewMode: "list" | "grouped" | "grid";
    onViewModeChange: (mode: "list" | "grouped" | "grid") => void;
    availableTags: string[];
    availableCategories: string[];
    tagCounts: Record<string, number>;
    totalPosts: number;
    filteredCount: number;
    /** 기본 화면에서 숨겨진 Notes 글 수 (숫자 차이의 이유를 알려주기 위함) */
    hiddenNotesCount?: number;
}

export const BlogFilterBar = ({
    searchQuery,
    onSearchChange,
    onDebouncedSearchChange,
    selectedTags,
    onTagsChange,
    selectedCategory,
    onCategoryChange,
    sortOrder,
    onSortChange,
    viewMode,
    onViewModeChange,
    availableTags,
    availableCategories,
    tagCounts,
    totalPosts,
    filteredCount,
    hiddenNotesCount = 0,
}: BlogFilterBarProps) => {
    const { t } = useTranslation();
    const isMobile = useCheckedMobileSize();
    // 모바일에서는 검색창만 두고 나머지 컨트롤은 '필터' 버튼으로 접어 첫 화면에 글이 보이게 함
    const [showControls, setShowControls] = useState(false);
    const hasActiveFilters = searchQuery || selectedTags.length > 0 || selectedCategory;
    const activeFilterCount = selectedTags.length + (selectedCategory ? 1 : 0);
    const controlsVisible = !isMobile || showControls;

    const clearAllFilters = () => {
        onSearchChange("");
        onTagsChange([]);
        onCategoryChange("");
    };

    return (
        <div className="space-y-4">
            {/* 필터 컨트롤 */}
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap lg:flex-nowrap">
                {/* 검색 입력 */}
                <div className="flex-1 min-w-0 sm:min-w-62.5">
                    <BlogSearchInput
                        value={searchQuery}
                        onChange={onSearchChange}
                        onDebouncedChange={onDebouncedSearchChange}
                    />
                </div>

                {isMobile && (
                    <button
                        type="button"
                        aria-expanded={showControls}
                        aria-controls="blog-filter-controls"
                        onClick={() => setShowControls(value => !value)}
                        className="workbench-button self-start"
                    >
                        <LuSlidersHorizontal aria-hidden="true" />
                        {t("pages.blog.filter.toggle")}{activeFilterCount > 0 ? ` (${activeFilterCount})` : ""}
                    </button>
                )}

                {/* 필터 및 정렬 버튼들 */}
                {controlsVisible && <div id="blog-filter-controls" className="flex sm:gap-3 gap-2 flex-wrap lg:flex-nowrap">
                    <BlogTagFilter
                        availableTags={availableTags}
                        selectedTags={selectedTags}
                        onTagsChange={onTagsChange}
                        tagCounts={tagCounts}
                    />

                    {availableCategories.length > 0 && <BlogCategoryFilter
                        availableCategories={availableCategories}
                        selectedCategory={selectedCategory}
                        onCategoryChange={onCategoryChange}
                    />}

                    <BlogSortToggle
                        sortOrder={sortOrder}
                        onSortChange={onSortChange}
                    />

                    <BlogViewToggle
                        viewMode={viewMode}
                        onViewModeChange={onViewModeChange}
                    />
                </div>}
            </div>

            {/* 선택된 태그 및 결과 정보 */}
            <div className="flex items-center justify-between gap-3 flex-wrap">
                {/* 선택된 태그 배지 */}
                {selectedTags.length > 0 && (
                    <div className="flex items-center gap-2 flex-wrap">
                        {selectedTags.map((tag) => (
                            <span
                                key={tag}
                                className={[
                                    "inline-flex items-center gap-1.5 px-3 py-1",
                                    "rounded-full text-xs font-medium",
                                    "bg-primary/10 blog-dark:bg-primary/20",
                                    "text-primary blog-dark:text-primary",
                                    "border border-primary/20 blog-dark:border-primary/30",
                                ].join(" ")}
                            >
                                #{tag}
                                <button
                                    type="button"
                                    onClick={() =>
                                        onTagsChange(
                                            selectedTags.filter((t) => t !== tag)
                                        )
                                    }
                                    aria-label={t("pages.blog.filter.removeTag", { tag })}
                                    className="hover:text-primary/70 transition-colors"
                                >
                                    <LuX className="w-3.5 h-3.5" />
                                </button>
                            </span>
                        ))}
                    </div>
                )}

                {/* 결과 카운트 및 필터 초기화 */}
                <div className="flex items-center gap-3 ml-auto">
                    <span
                        className="text-[clamp(0.75rem,1vw,0.875rem)] text-muted blog-dark:text-muted tabular-nums"
                        role="status"
                        aria-live="polite"
                    >
                        {filteredCount === totalPosts
                            ? t("pages.blog.count.total", { count: totalPosts })
                            : hiddenNotesCount > 0 && filteredCount + hiddenNotesCount === totalPosts
                                ? t("pages.blog.count.notesHidden", { count: filteredCount, hidden: hiddenNotesCount })
                                : t("pages.blog.count.filtered", { filtered: filteredCount, total: totalPosts })}
                    </span>

                    {hasActiveFilters && (
                        <button
                            type="button"
                            onClick={clearAllFilters}
                            className={[
                                "text-xs font-medium px-3 min-h-11",
                                "rounded-md",
                                "text-muted blog-dark:text-muted",
                                "hover:text-foreground blog-dark:hover:text-foreground",
                                "hover:bg-panel blog-dark:hover:bg-panel",
                                "transition-all duration-200",
                            ].join(" ")}
                        >
                            {t("pages.blog.filter.resetFilters")}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};
