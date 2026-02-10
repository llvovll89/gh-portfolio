import {Link} from "react-router-dom";
import type {BlogPost} from "../../../utils/loadPosts";

interface BlogCardProps {
    p: BlogPost;
}

export const BlogCard = ({p}: BlogCardProps) => {
    return (
        <li className="list-none">
            <Link
                to={`/blog/${p.slug}`}
                className={[
                    "group relative flex flex-col sm:flex-row sm:items-center overflow-hidden rounded-xl border",
                    "border-zinc-200/80 dark:border-zinc-800/50",
                    "px-4 py-4 sm:px-6 sm:py-5 transition-all duration-300",
                    "hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/5",
                    "hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30",
                ].join(" ")}
            >
                {/* 왼쪽 메타데이터 섹션 */}
                <div className="flex flex-col items-start gap-2 sm:min-w-35 pb-3 sm:pb-0 sm:pr-6 border-b sm:border-b-0 sm:border-r border-zinc-200/60 dark:border-zinc-700/60">
                    <time className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
                        {p.date || "No Date"}
                    </time>
                    {p.tags?.length ? (
                        <div className="flex flex-wrap gap-1">
                            {p.tags.slice(0, 2).map((t) => (
                                <span
                                    key={t}
                                    className="text-[10px] font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30 px-1.5 py-0.5 rounded"
                                >
                                    {t}
                                </span>
                            ))}
                        </div>
                    ) : null}
                </div>

                {/* 오른쪽 콘텐츠 섹션 */}
                <div className="flex-1 pt-3 sm:pt-0 sm:pl-6 min-w-0">
                    <h3 className="text-base sm:text-xl font-bold leading-snug text-zinc-900 dark:text-zinc-100 mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {p.title}
                    </h3>

                    {(p.summary || p.body) && (
                        <p className="line-clamp-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                            {p.summary ?? p.body}
                        </p>
                    )}
                </div>

                {/* 호버 시 화살표 아이콘 */}
                <div className="hidden sm:block ml-4 opacity-0 -translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0">
                    <svg
                        className="w-5 h-5 text-blue-600 dark:text-blue-400"
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
