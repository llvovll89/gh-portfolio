import { BlogSearchInput } from "./BlogSearchInput";
import { BlogTagFilter } from "./BlogTagFilter";
import { BlogSortToggle } from "./BlogSortToggle";
import { BlogViewToggle } from "./BlogViewToggle";
import { HiX } from "react-icons/hi";

interface BlogFilterBarProps {
    searchQuery: string;
    onSearchChange: (query: string) => void;
    onDebouncedSearchChange: (query: string) => void;
    selectedTags: string[];
    onTagsChange: (tags: string[]) => void;
    sortOrder: "asc" | "desc";
    onSortChange: (order: "asc" | "desc") => void;
    viewMode: "list" | "grouped";
    onViewModeChange: (mode: "list" | "grouped") => void;
    availableTags: string[];
    tagCounts: Record<string, number>;
    totalPosts: number;
    filteredCount: number;
}

export const BlogFilterBar = ({
    searchQuery,
    onSearchChange,
    onDebouncedSearchChange,
    selectedTags,
    onTagsChange,
    sortOrder,
    onSortChange,
    viewMode,
    onViewModeChange,
    availableTags,
    tagCounts,
    totalPosts,
    filteredCount,
}: BlogFilterBarProps) => {
    const hasActiveFilters = searchQuery || selectedTags.length > 0;

    const clearAllFilters = () => {
        onSearchChange("");
        onTagsChange([]);
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

                {/* 필터 및 정렬 버튼들 */}
                <div className="flex gap-3 flex-wrap sm:flex-nowrap">
                    <BlogTagFilter
                        availableTags={availableTags}
                        selectedTags={selectedTags}
                        onTagsChange={onTagsChange}
                        tagCounts={tagCounts}
                    />

                    <BlogSortToggle
                        sortOrder={sortOrder}
                        onSortChange={onSortChange}
                    />

                    <BlogViewToggle
                        viewMode={viewMode}
                        onViewModeChange={onViewModeChange}
                    />
                </div>
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
                                    "bg-primary/10 dark:bg-primary/20",
                                    "text-primary dark:text-primary",
                                    "border border-primary/20 dark:border-primary/30",
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
                                    aria-label={`${tag} 태그 제거`}
                                    className="hover:text-primary/70 transition-colors"
                                >
                                    <HiX className="w-3.5 h-3.5" />
                                </button>
                            </span>
                        ))}
                    </div>
                )}

                {/* 결과 카운트 및 필터 초기화 */}
                <div className="flex items-center gap-3 ml-auto">
                    <span
                        className="text-sm text-zinc-600 dark:text-zinc-400 tabular-nums"
                        role="status"
                        aria-live="polite"
                    >
                        {filteredCount === totalPosts
                            ? `${totalPosts}개의 포스트`
                            : `${filteredCount} / ${totalPosts}개 표시`}
                    </span>

                    {hasActiveFilters && (
                        <button
                            type="button"
                            onClick={clearAllFilters}
                            className={[
                                "text-xs font-medium px-3 py-1.5",
                                "rounded-lg",
                                "text-zinc-600 dark:text-zinc-400",
                                "hover:text-zinc-900 dark:hover:text-zinc-100",
                                "hover:bg-zinc-100 dark:hover:bg-zinc-800",
                                "transition-all duration-200",
                            ].join(" ")}
                        >
                            필터 초기화
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};
