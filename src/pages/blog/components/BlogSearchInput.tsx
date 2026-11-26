import { useEffect, useRef, useState } from "react";
import { LuSearch, LuX } from "react-icons/lu";
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
    const inputRef = useRef<HTMLInputElement>(null);

    // "/" 로 검색창 포커스 (GitHub·MDN 과 같은 관례) — 입력 중이거나 수정키 조합이면 무시
    useEffect(() => {
        const handleSlash = (e: KeyboardEvent) => {
            if (e.key !== "/" || e.ctrlKey || e.metaKey || e.altKey || e.defaultPrevented) return;
            const target = e.target instanceof HTMLElement ? e.target : null;
            if (target?.closest("input, textarea, select, [contenteditable='true'], [role='dialog']")) return;
            e.preventDefault();
            inputRef.current?.focus();
        };
        window.addEventListener("keydown", handleSlash);
        return () => window.removeEventListener("keydown", handleSlash);
    }, []);

    // 디바운싱 처리 (200ms) - 타이머(외부 시스템)와 동기화하는 표시 상태이므로 effect가 적절함
    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
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
                <LuSearch
                    className={[
                        "w-5 h-5 text-muted blog-dark:text-muted transition-transform",
                        isDebouncing ? "animate-pulse" : "",
                    ].join(" ")}
                />
            </div>

            <input
                ref={inputRef}
                type="text"
                role="searchbox"
                aria-keyshortcuts="/"
                aria-label={t("pages.blog.search.label")}
                placeholder={t("pages.blog.search.placeholder")}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onKeyDown={handleKeyDown}
                className={[
                    "peer w-full h-11 pl-10 pr-10",
                    "rounded-md border",
                    "border-line blog-dark:border-line",
                    "bg-panel blog-dark:bg-panel",
                    "text-sm text-foreground blog-dark:text-foreground",
                    "placeholder:text-muted blog-dark:placeholder:text-muted",
                    "focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary",
                    "transition-all duration-200",
                ].join(" ")}
            />

            {/* 단축키 힌트 — 비어 있고 포커스가 없을 때만 (peer-focus 로 숨김) */}
            {!value && (
                <kbd
                    aria-hidden="true"
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rounded border border-line bg-inset px-1.5 py-0.5 font-mono text-2xs text-muted peer-focus:hidden"
                >
                    /
                </kbd>
            )}

            {value && (
                <button
                    type="button"
                    onClick={handleClear}
                    aria-label={t("pages.blog.search.clear")}
                    className={[
                        "absolute right-3 top-1/2 -translate-y-1/2",
                        "p-1 rounded-full",
                        "text-muted hover:text-muted",
                        "blog-dark:text-muted blog-dark:hover:text-muted",
                        "hover:bg-panel blog-dark:hover:bg-panel",
                        "transition-all duration-200",
                    ].join(" ")}
                >
                    <LuX className="w-4 h-4" />
                </button>
            )}
        </div>
    );
};
