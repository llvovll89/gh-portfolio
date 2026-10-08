import { LuArrowUp, LuArrowDown } from "react-icons/lu";
import { useTranslation } from "react-i18next";

interface BlogSortToggleProps {
    sortOrder: "asc" | "desc";
    onSortChange: (order: "asc" | "desc") => void;
}

export const BlogSortToggle = ({
    sortOrder,
    onSortChange,
}: BlogSortToggleProps) => {
    const { t } = useTranslation();

    const handleToggle = () => {
        onSortChange(sortOrder === "desc" ? "asc" : "desc");
    };

    const orderLabel = sortOrder === "desc" ? t("pages.blog.sort.newest") : t("pages.blog.sort.oldest");

    return (
        <button
            type="button"
            onClick={handleToggle}
            aria-label={t("pages.blog.sort.label", { order: orderLabel })}
            aria-pressed={sortOrder === "desc"}
            className={[
                "flex items-center gap-2 sm:h-11 h-9 px-4",
                "rounded-2xl border",
                "border-line blog-dark:border-line",
                "bg-panel blog-dark:bg-panel",
                "text-sm font-medium",
                "text-foreground blog-dark:text-foreground",
                "hover:border-primary/50 hover:shadow-md",
                "focus:outline-none focus:ring-2 focus:ring-primary/50",
                "transition-all duration-200",
            ].join(" ")}
        >
            {sortOrder === "desc" ? (
                <LuArrowDown className="w-5 h-5" />
            ) : (
                <LuArrowUp className="w-5 h-5" />
            )}
            <span className="whitespace-nowrap">
                {orderLabel}
            </span>
        </button>
    );
};
