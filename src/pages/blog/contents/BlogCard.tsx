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
                    "group relative flex flex-col h-full overflow-hidden rounded-2xl border",
                    "border-zinc-200/80 dark:border-zinc-800/50",
                    "p-5 transition-all duration-300",
                    "hover:border-primary/50 hover:shadow-md hover:shadow-primary/10 hover:-translate-y-1",
                    "hover:bg-linear-to-br hover:from-blue-50/10 hover:to-transparent",
                ].join(" ")}
            >
                <div className="absolute inset-0 -z-10 bg-linear-to-br from-blue-50/50 to-transparent opacity-0 transition-opacity group-hover:opacity-100 dark:from-blue-900/10" />

                <div className="flex flex-col h-full">
                    <div className="mb-3 flex items-center gap-2">
                        <time className="text-[11px] font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-500">
                            {p.date || "No Date"}
                        </time>
                        <span className="h-px w-4 bg-zinc-300 dark:bg-zinc-700"></span>
                    </div>

                    <h3 className="text-lg font-bold leading-tight text-zinc-900 dark:text-zinc-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {p.title}
                    </h3>

                    {(p.summary || p.body) && (
                        <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                            {p.summary ?? p.body}
                        </p>
                    )}

                    <div className="mt-auto pt-5">
                        {p.tags?.length ? (
                            <div className="flex flex-wrap gap-1.5">
                                {p.tags.slice(0, 3).map((t) => (
                                    <span
                                        key={t}
                                        className="rounded-md bg-zinc-100 dark:bg-zinc-800/80 px-2 py-0.5 text-[11px] font-medium text-zinc-600 dark:text-zinc-400 border border-transparent group-hover:border-zinc-200 dark:group-hover:border-zinc-700 transition-colors"
                                    >
                                        #{t}
                                    </span>
                                ))}
                            </div>
                        ) : (
                            <div className="text-[11px] text-zinc-400 italic">
                                No tags
                            </div>
                        )}
                    </div>
                </div>
            </Link>
        </li>
    );
};
