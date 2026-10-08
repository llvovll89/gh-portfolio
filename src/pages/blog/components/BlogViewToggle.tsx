import { LuLayoutGrid, LuList, LuGrid3X3 } from "react-icons/lu";
import { useTranslation } from "react-i18next";

interface BlogViewToggleProps {
    viewMode: "list" | "grouped" | "grid";
    onViewModeChange: (mode: "list" | "grouped" | "grid") => void;
}

export const BlogViewToggle = ({
    viewMode,
    onViewModeChange,
}: BlogViewToggleProps) => {
    const { t } = useTranslation();
    return (
        <div
            role="radiogroup"
            aria-label={t("pages.blog.view.label")}
            className={[
                "inline-flex items-center gap-1 sm:h-11 h-9 p-1",
                "rounded-2xl border",
                "border-line blog-dark:border-line",
                "bg-panel blog-dark:bg-panel",
            ].join(" ")}
        >
            <button
                type="button"
                role="radio"
                aria-checked={viewMode === "list"}
                onClick={() => onViewModeChange("list")}
                className={[
                    "flex items-center gap-1.5 px-3 py-1.5",
                    "rounded-xl text-sm font-medium",
                    "transition-all duration-200",
                    viewMode === "list"
                        ? "bg-panel blog-dark:bg-panel text-foreground blog-dark:text-foreground shadow-sm"
                        : "text-muted blog-dark:text-muted hover:text-foreground blog-dark:hover:text-foreground",
                ].join(" ")}
            >
                <LuList className="w-4 h-4" />
                <span className="whitespace-nowrap">{t("pages.blog.view.list")}</span>
            </button>

            <button
                type="button"
                role="radio"
                aria-checked={viewMode === "grid"}
                onClick={() => onViewModeChange("grid")}
                className={[
                    "flex items-center gap-1.5 px-3 py-1.5",
                    "rounded-xl text-sm font-medium",
                    "transition-all duration-200",
                    viewMode === "grid"
                        ? "bg-panel blog-dark:bg-panel text-foreground blog-dark:text-foreground shadow-sm"
                        : "text-muted blog-dark:text-muted hover:text-foreground blog-dark:hover:text-foreground",
                ].join(" ")}
            >
                <LuGrid3X3 className="w-4 h-4" />
                <span className="whitespace-nowrap">{t("pages.blog.view.grid") ?? "카드"}</span>
            </button>

            <button
                type="button"
                role="radio"
                aria-checked={viewMode === "grouped"}
                onClick={() => onViewModeChange("grouped")}
                className={[
                    "flex items-center gap-1.5 px-3 py-1.5",
                    "rounded-xl text-sm font-medium",
                    "transition-all duration-200",
                    viewMode === "grouped"
                        ? "bg-panel blog-dark:bg-panel text-foreground blog-dark:text-foreground shadow-sm"
                        : "text-muted blog-dark:text-muted hover:text-foreground blog-dark:hover:text-foreground",
                ].join(" ")}
            >
                <LuLayoutGrid className="w-4 h-4" />
                <span className="whitespace-nowrap">{t("pages.blog.view.grouped")}</span>
            </button>
        </div>
    );
};
