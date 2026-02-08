import { useEffect, useState } from "react";
import { HiSearch, HiX } from "react-icons/hi";
import { useTranslation } from "react-i18next";

interface BlogSearchInputProps {
    value: string;
    onChange: (value: string) => void;
    onDebouncedChange: (value: string) => void;
}

export const BlogSearchInput = ({
    value,
    onChange,
    onDebouncedChange,
}: BlogSearchInputProps) => {
    const { t } = useTranslation();
    const [isDebouncing, setIsDebouncing] = useState(false);

    // 디바운싱 처리 (200ms)
    useEffect(() => {
        setIsDebouncing(true);
        const timer = setTimeout(() => {
            onDebouncedChange(value);
            setIsDebouncing(false);
        }, 200);

        return () => clearTimeout(timer);
    }, [value, onDebouncedChange]);

    // ESC 키로 검색 초기화
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Escape") {
            onChange("");
            e.currentTarget.blur();
        }
    };

    // 클리어 버튼
    const handleClear = () => {
        onChange("");
    };

    return (
        <div className="relative w-full">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <HiSearch
                    className={[
                        "w-5 h-5 text-zinc-400 dark:text-zinc-500 transition-transform",
                        isDebouncing ? "animate-pulse" : "",
                    ].join(" ")}
                />
            </div>

            <input
                type="text"
                role="searchbox"
                aria-label={t("pages.blog.search.label")}
                placeholder={t("pages.blog.search.placeholder")}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onKeyDown={handleKeyDown}
                className={[
                    "w-full h-11 pl-10 pr-10",
                    "rounded-2xl border",
                    "border-zinc-200/80 dark:border-zinc-800/50",
                    "bg-white dark:bg-zinc-900/50",
                    "text-sm text-zinc-900 dark:text-zinc-100",
                    "placeholder:text-zinc-400 dark:placeholder:text-zinc-500",
                    "focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary",
                    "transition-all duration-200",
                ].join(" ")}
            />

            {value && (
                <button
                    type="button"
                    onClick={handleClear}
                    aria-label={t("pages.blog.search.clear")}
                    className={[
                        "absolute right-3 top-1/2 -translate-y-1/2",
                        "p-1 rounded-full",
                        "text-zinc-400 hover:text-zinc-600",
                        "dark:text-zinc-500 dark:hover:text-zinc-300",
                        "hover:bg-zinc-100 dark:hover:bg-zinc-800",
                        "transition-all duration-200",
                    ].join(" ")}
                >
                    <HiX className="w-4 h-4" />
                </button>
            )}
        </div>
    );
};
