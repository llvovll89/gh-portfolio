import { useTranslation } from "react-i18next";
import { LuLayers } from "react-icons/lu";

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
            <LuLayers className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <select
                value={selectedCategory}
                onChange={(e) => onCategoryChange(e.target.value)}
                aria-label={t("pages.blog.filter.categoryFilter")}
                className={[
                    "sm:h-11 h-9 pl-9 pr-8 rounded-2xl border text-sm",
                    "border-line blog-dark:border-line",
                    "bg-panel blog-dark:bg-panel",
                    "text-foreground blog-dark:text-foreground",
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
