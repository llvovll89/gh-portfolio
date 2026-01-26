import {useMemo} from "react";
import {useParams, Link} from "react-router-dom";
import {loadPosts} from "../../../utils/loadPosts";
import {MarkdownRenderer} from "./MarkdownRender";

export const Detail = () => {
    const {slug} = useParams<{slug: string}>();

    const post = useMemo(() => {
        const posts = loadPosts();
        return posts.find((p) => p.slug === slug);
    }, [slug]);

    if (!slug) {
        return (
            <div className="py-6">
                <p className="text-zinc-700 dark:text-zinc-300">
                    잘못된 접근입니다.
                </p>
                <Link
                    className="mt-3 inline-block underline underline-offset-4"
                    to="/blog"
                >
                    목록으로
                </Link>
            </div>
        );
    }

    if (!post) {
        return (
            <div className="py-6">
                <p className="text-zinc-700 dark:text-zinc-300">
                    글을 찾을 수 없습니다: {slug}
                </p>
                <Link
                    className="mt-3 inline-block underline underline-offset-4"
                    to="/blog"
                >
                    목록으로
                </Link>
            </div>
        );
    }

    return (
        <section className="w-full h-full flex flex-col md:py-10 md:px-15 p-4">
            <div className="mb-4">
                <Link
                    to="/blog"
                    className="text-sm underline underline-offset-4 text-zinc-600"
                >
                    ← Posts
                </Link>
            </div>

            <header className="mb-6">
                <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900">
                    {post.title}
                </h1>

                <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm select-none">
                    <span className="text-[clamp(0.75rem,1.5vw,0.9rem)]">
                        {post.date || "날짜 없음"}
                    </span>
                    {post.tags?.length ? (
                        <div className="flex flex-wrap gap-2">
                            {post.tags.map((t) => (
                                <span
                                    key={t}
                                    className="rounded-full border border-zinc-200 bg-black/80 text-white dark:border-zinc-800 px-2 py-0.5 text-xs"
                                >
                                    {t}
                                </span>
                            ))}
                        </div>
                    ) : null}
                </div>

                {post.summary ? (
                    <p className="mt-2 text-zinc-800 leading-7">
                        {post.summary}
                    </p>
                ) : null}
            </header>

            <MarkdownRenderer content={post.body} />
        </section>
    );
};
