import { useTranslation } from "react-i18next";
import { HiCollection } from "react-icons/hi";

interface BlogCategoryFilterProps {
    availableCategories: string[];
    selectedCategory: string;
    onCategoryChange: (category: string) => void;
}

export const BlogCategoryFilter = ({
    availableCategories,
    selectedCategory,
    onCategoryChange,
}: BlogCategoryFilterProps) => {
    const { t } = useTranslation();

    return (
        <div className="relative">
            <HiCollection className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <select
                value={selectedCategory}
                onChange={(e) => onCategoryChange(e.target.value)}
                aria-label={t("pages.blog.filter.categoryFilter")}
                className={[
                    "sm:h-11 h-9 pl-9 pr-8 rounded-2xl border text-sm",
                    "border-zinc-200/80 dark:border-zinc-800/50",
                    "bg-white dark:bg-zinc-900/50",
                    "text-zinc-900 dark:text-zinc-100",
                    "focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary",
                    "transition-all duration-200",
                ].join(" ")}
            >
                <option value="">{t("pages.blog.filter.allCategories")}</option>
                {availableCategories.map((category) => (
                    <option key={category} value={category}>
                        {category}
                    </option>
                ))}
            </select>
        </div>
    );
};
