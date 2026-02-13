import { HiViewGrid, HiViewList } from "react-icons/hi";
import { MdGridView } from "react-icons/md";
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
                "border-zinc-200/80 dark:border-zinc-800/50",
                "bg-zinc-100/50 dark:bg-zinc-900/50",
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
                        ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm"
                        : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200",
                ].join(" ")}
            >
                <HiViewList className="w-4 h-4" />
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
                        ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm"
                        : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200",
                ].join(" ")}
            >
                <MdGridView className="w-4 h-4" />
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
                        ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm"
                        : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200",
                ].join(" ")}
            >
                <HiViewGrid className="w-4 h-4" />
                <span className="whitespace-nowrap">{t("pages.blog.view.grouped")}</span>
            </button>
        </div>
    );
};
