import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import { LuEye } from "react-icons/lu";
import type { BlogPost } from "../../../utils/loadPosts";
import { getListViewCount } from "../../../utils/viewCounts";
import { getBodySnippet } from "../../../utils/fuseSearch";

interface BlogCardProps {
    p: BlogPost;
    searchQuery?: string;
    index?: number;
}

export const BlogCard = ({ p, searchQuery = "", index = 0 }: BlogCardProps) => {
    const { t } = useTranslation();
    const [viewCount, setViewCount] = useState<number | null>(null);

    const prefersReducedMotion = useMemo(
        () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
        []
    );

    const animStyle = useMemo(
        () => (prefersReducedMotion ? undefined : { animationDelay: `${index * 0.05}s` }),
        [index, prefersReducedMotion]
    );

    useEffect(() => {
        getListViewCount(p.slug).then(setViewCount).catch(() => {});
    }, [p.slug]);

    // 본문 스니펫: 검색어가 제목·요약에 없고 본문에만 있을 때 표시
    const bodySnippet = useMemo(() => {
        if (!searchQuery.trim()) return null;
        const keywords = searchQuery.trim().toLowerCase().split(/\s+/).filter(k => k.length >= 2);
        return getBodySnippet(p, keywords);
    }, [p, searchQuery]);

    return (
        <li className={`list-none${prefersReducedMotion ? "" : " animate-fade-in-up"}`} style={animStyle}>
            <Link
                to={`/blog/${p.slug}`}
                className={[
                    "blog-entry group relative flex flex-col sm:flex-row sm:items-center overflow-hidden",
                    "border-line blog-dark:border-line",
                    "px-4 py-4 sm:px-6 sm:py-5 transition-all duration-300",
                    "hover:border-primary/50",
                    "hover:bg-panel blog-dark:hover:bg-panel",
                ].join(" ")}
            >
                {/* 왼쪽 메타데이터 섹션 */}
                {/* 모바일은 메타 정보를 한 줄로 흘려 제목이 첫 화면에 빨리 보이게 함 */}
                <div className="flex flex-row flex-wrap items-center gap-x-3 gap-y-1.5 sm:flex-col sm:items-start sm:gap-2 sm:min-w-35 pb-2 sm:pb-0 sm:pr-6 sm:border-r border-line blog-dark:border-line">
                    <time className="font-mono text-xs text-muted blog-dark:text-muted">
                        {p.date || "No Date"}
                    </time>
                    {p.readingTime && (
                        <span className="text-xs text-muted blog-dark:text-muted">
                            {t("pages.blog.readingMinutes", { count: parseInt(p.readingTime, 10) })}
                        </span>
                    )}
                    {viewCount !== null && viewCount > 0 && (
                        <span className="flex items-center gap-1 text-xs text-muted blog-dark:text-muted">
                            <LuEye className="w-3 h-3" />
                            {viewCount.toLocaleString()}
                        </span>
                    )}
                    {p.type === "html" && (
                        <span className="text-xs font-semibold text-primary bg-primary/10 px-1.5 py-0.5 rounded-md">
                            HTML
                        </span>
                    )}
                    {p.category && (
                        <span className="text-xs font-semibold text-violet-600 blog-dark:text-violet-400 bg-violet-50 blog-dark:bg-violet-950/30 px-1.5 py-0.5 rounded-md">
                            {p.category}
                        </span>
                    )}
                    {p.tags?.length ? (
                        <div className="flex flex-wrap gap-1">
                            {p.tags.slice(0, 2).map((t) => (
                                <span
                                    key={t}
                                    className="text-xs font-medium text-primary bg-primary/10 px-1.5 py-0.5 rounded-md"
                                >
                                    {t}
                                </span>
                            ))}
                        </div>
                    ) : null}
                </div>

                {/* 오른쪽 콘텐츠 섹션 */}
                <div className="flex-1 pt-1 sm:pt-0 sm:pl-6 min-w-0">
                    <h3 className="text-[17px] sm:text-xl font-semibold leading-snug text-foreground mb-2 group-hover:text-primary transition-colors">
                        {p.title}
                    </h3>

                    {(p.summary || (p.type !== "html" && p.body)) && (
                        <p className="line-clamp-2 text-sm leading-relaxed text-muted">
                            {p.summary ?? p.body}
                        </p>
                    )}

                    {bodySnippet && (
                        <p className="mt-1.5 line-clamp-2 text-[clamp(0.7rem,1vw,0.8rem)] leading-relaxed text-muted italic border-l-2 border-primary/50 pl-2">
                            {bodySnippet}
                        </p>
                    )}
                </div>

                {/* 호버 시 화살표 아이콘 */}
                <div className="hidden sm:block ml-4 opacity-0 -translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0">
                    <svg
                        className="w-5 h-5 text-primary"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </div>
            </Link>
        </li>
    );
};
