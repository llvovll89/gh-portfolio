import { useRef, useState } from "react";
import { LuChevronDown, LuFilter } from "react-icons/lu";
import { useClosePopup } from "../../../hooks/useClosePopup";
import { useTranslation } from "react-i18next";

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
    const { t } = useTranslation();
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
                aria-controls="tag-filter-menu"
                aria-label={selectedTags.length > 0
                    ? t("pages.blog.filter.selectedTags", { count: selectedTags.length })
                    : t("pages.blog.filter.allTags")
                }
                className={[
                    "flex items-center gap-2 sm:h-11 h-9 px-4",
                    "rounded-2xl border",
                    selectedTags.length > 0
                        ? "border-primary/50 bg-primary/5 blog-dark:bg-primary/10"
                        : "border-line blog-dark:border-line bg-panel blog-dark:bg-panel",
                    "text-sm font-medium",
                    "text-foreground blog-dark:text-foreground",
                    "hover:border-primary/50 hover:shadow-md",
                    "focus:outline-none focus:ring-2 focus:ring-primary/50",
                    "transition-all duration-200",
                ].join(" ")}
            >
                <LuFilter className="w-4 h-4" />
                <span>
                    {selectedTags.length > 0
                        ? t("pages.blog.filter.selectedTags", { count: selectedTags.length })
                        : t("pages.blog.filter.allTags")}
                </span>
                <LuChevronDown
                    className={[
                        "w-4 h-4 transition-transform duration-200",
                        isOpen ? "rotate-180" : "",
                    ].join(" ")}
                />
            </button>

            {isOpen && (
                <div
                    id="tag-filter-menu"
                    role="menu"
                    aria-label={t("pages.blog.filter.tagFilter")}
                    className={[
                        "absolute top-full left-0 mt-2 z-50",
                        "w-72 max-h-96 overflow-y-auto",
                        "rounded-2xl border",
                        "border-line blog-dark:border-line",
                        "bg-panel blog-dark:bg-panel",
                        "shadow-lg shadow-zinc-900/10 blog-dark:shadow-black/30",
                        "scrolls",
                    ].join(" ")}
                >
                    <div className="sticky top-0 z-10 bg-panel blog-dark:bg-panel border-b border-line blog-dark:border-line px-4 py-3">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-foreground blog-dark:text-foreground">
                                {t("pages.blog.filter.tagFilter")}
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
                                    {t("pages.blog.filter.clearAll")}
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="p-2">
                        {availableTags.length === 0 ? (
                            <div className="px-3 py-6 text-center text-sm text-muted blog-dark:text-muted">
                                {t("pages.blog.filter.noTags")}
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
                                            "hover:bg-panel blog-dark:hover:bg-panel",
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
                                                "border-line blog-dark:border-line",
                                                "text-primary focus:ring-2 focus:ring-primary/50",
                                                "cursor-pointer",
                                            ].join(" ")}
                                        />
                                        <span className="flex-1 text-sm text-foreground blog-dark:text-foreground">
                                            #{tag}
                                        </span>
                                        <span className="text-xs text-muted blog-dark:text-muted tabular-nums">
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
