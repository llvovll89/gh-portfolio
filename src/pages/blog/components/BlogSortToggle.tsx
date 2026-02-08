import { HiSortAscending, HiSortDescending } from "react-icons/hi";

interface BlogSortToggleProps {
    sortOrder: "asc" | "desc";
    onSortChange: (order: "asc" | "desc") => void;
}

export const BlogSortToggle = ({
    sortOrder,
    onSortChange,
}: BlogSortToggleProps) => {
    const handleToggle = () => {
        onSortChange(sortOrder === "desc" ? "asc" : "desc");
    };

    return (
        <button
            type="button"
            onClick={handleToggle}
            aria-label={`정렬 순서: ${sortOrder === "desc" ? "최신순" : "오래된순"}`}
            aria-pressed={sortOrder === "desc"}
            className={[
                "flex items-center gap-2 h-11 px-4",
                "rounded-2xl border",
                "border-zinc-200/80 dark:border-zinc-800/50",
                "bg-white dark:bg-zinc-900/50",
                "text-sm font-medium",
                "text-zinc-900 dark:text-zinc-100",
                "hover:border-primary/50 hover:shadow-md",
                "focus:outline-none focus:ring-2 focus:ring-primary/50",
                "transition-all duration-200",
            ].join(" ")}
        >
            {sortOrder === "desc" ? (
                <HiSortDescending className="w-5 h-5" />
            ) : (
                <HiSortAscending className="w-5 h-5" />
            )}
            <span className="whitespace-nowrap">
                {sortOrder === "desc" ? "최신순" : "오래된순"}
            </span>
        </button>
    );
};
