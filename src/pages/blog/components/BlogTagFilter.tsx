import { useRef, useState } from "react";
import { HiChevronDown, HiFilter } from "react-icons/hi";
import { useClosePopup } from "../../../hooks/useClosePopup";

interface BlogTagFilterProps {
    availableTags: string[];
    selectedTags: string[];
    onTagsChange: (tags: string[]) => void;
    tagCounts: Record<string, number>;
}

export const BlogTagFilter = ({
    availableTags,
    selectedTags,
    onTagsChange,
    tagCounts,
}: BlogTagFilterProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useClosePopup({
        elementRef: dropdownRef,
        callBack: () => setIsOpen(false),
    });

    const toggleDropdown = () => setIsOpen(!isOpen);

    const toggleTag = (tag: string) => {
        if (selectedTags.includes(tag)) {
            onTagsChange(selectedTags.filter((t) => t !== tag));
        } else {
            onTagsChange([...selectedTags, tag]);
        }
    };

    const clearAll = () => {
        onTagsChange([]);
    };

    return (
        <div ref={dropdownRef} className="relative">
            <button
                type="button"
                onClick={toggleDropdown}
                aria-haspopup="menu"
                aria-expanded={isOpen}
                className={[
                    "flex items-center gap-2 h-11 px-4",
                    "rounded-2xl border",
                    selectedTags.length > 0
                        ? "border-primary/50 bg-primary/5 dark:bg-primary/10"
                        : "border-zinc-200/80 dark:border-zinc-800/50 bg-white dark:bg-zinc-900/50",
                    "text-sm font-medium",
                    "text-zinc-900 dark:text-zinc-100",
                    "hover:border-primary/50 hover:shadow-md",
                    "focus:outline-none focus:ring-2 focus:ring-primary/50",
                    "transition-all duration-200",
                ].join(" ")}
            >
                <HiFilter className="w-4 h-4" />
                <span>
                    {selectedTags.length > 0
                        ? `태그 (${selectedTags.length})`
                        : "모든 태그"}
                </span>
                <HiChevronDown
                    className={[
                        "w-4 h-4 transition-transform duration-200",
                        isOpen ? "rotate-180" : "",
                    ].join(" ")}
                />
            </button>

            {isOpen && (
                <div
                    role="menu"
                    aria-label="태그 필터"
                    className={[
                        "absolute top-full left-0 mt-2 z-50",
                        "w-72 max-h-96 overflow-y-auto",
                        "rounded-2xl border",
                        "border-zinc-200/80 dark:border-zinc-800/50",
                        "bg-white dark:bg-zinc-900",
                        "shadow-lg shadow-zinc-900/10 dark:shadow-black/30",
                        "scrolls",
                    ].join(" ")}
                >
                    <div className="sticky top-0 z-10 bg-white dark:bg-zinc-900 border-b border-zinc-200/80 dark:border-zinc-800 px-4 py-3">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                                태그 필터
                            </span>
                            {selectedTags.length > 0 && (
                                <button
                                    type="button"
                                    onClick={clearAll}
                                    className={[
                                        "text-xs font-medium",
                                        "text-primary hover:text-primary/80",
                                        "transition-colors",
                                    ].join(" ")}
                                >
                                    전체 해제
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="p-2">
                        {availableTags.length === 0 ? (
                            <div className="px-3 py-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
                                사용 가능한 태그가 없습니다
                            </div>
                        ) : (
                            availableTags.map((tag) => {
                                const isSelected = selectedTags.includes(tag);
                                const count = tagCounts[tag] || 0;

                                return (
                                    <label
                                        key={tag}
                                        role="menuitemcheckbox"
                                        aria-checked={isSelected}
                                        className={[
                                            "flex items-center gap-3 px-3 py-2.5",
                                            "rounded-xl cursor-pointer",
                                            "hover:bg-zinc-100 dark:hover:bg-zinc-800/50",
                                            "transition-colors duration-150",
                                            "group",
                                        ].join(" ")}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={isSelected}
                                            onChange={() => toggleTag(tag)}
                                            className={[
                                                "w-4 h-4 rounded border-2",
                                                "border-zinc-300 dark:border-zinc-600",
                                                "text-primary focus:ring-2 focus:ring-primary/50",
                                                "cursor-pointer",
                                            ].join(" ")}
                                        />
                                        <span className="flex-1 text-sm text-zinc-900 dark:text-zinc-100">
                                            #{tag}
                                        </span>
                                        <span className="text-xs text-zinc-500 dark:text-zinc-400 tabular-nums">
                                            {count}
                                        </span>
                                    </label>
                                );
                            })
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
