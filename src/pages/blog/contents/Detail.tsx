import {useMemo, useState, useEffect} from "react";
import {useParams, Link, useNavigate} from "react-router-dom";
import {loadPosts} from "../../../utils/loadPosts";
import {MarkdownRenderer} from "./MarkdownRender";

export const Detail = () => {
    const {slug} = useParams<{slug: string}>();
    const navigate = useNavigate();

    const [showScrollButtons, setShowScrollButtons] = useState(false);

    const post = useMemo(() => {
        const posts = loadPosts();
        return posts.find((p) => p.slug === slug);
    }, [slug]);

    // 스크롤 이벤트 리스너
    useEffect(() => {
        const handleScroll = () => {
            // 300px 이상 스크롤 시 버튼 표시
            const shouldShow = window.scrollY > 300;
            setShowScrollButtons(shouldShow);
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // 위로 스크롤
    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    };

    // 뒤로가기
    const goBack = () => {
        navigate("/blog");
    };

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
                    {post.readingTime && (
                        <>
                            <span className="text-zinc-400 dark:text-zinc-600">•</span>
                            <span className="text-[clamp(0.75rem,1.5vw,0.9rem)] text-zinc-600 dark:text-zinc-400">
                                {post.readingTime}
                            </span>
                        </>
                    )}
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

            {/* 플로팅 버튼 */}
            {showScrollButtons && (
                <>
                    {/* 뒤로가기 버튼 (왼쪽 하단) */}
                    <button
                        onClick={goBack}
                        className="fixed left-6 bottom-6 z-50 flex items-center justify-center w-12 h-12 rounded-full bg-zinc-800 text-white shadow-lg hover:bg-zinc-700 transition-all duration-300 ease-in-out opacity-90 hover:opacity-100"
                        aria-label="뒤로가기"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                        </svg>
                    </button>

                    {/* 위로가기 버튼 (오른쪽 하단) */}
                    <button
                        onClick={scrollToTop}
                        className="fixed right-6 bottom-6 z-50 flex items-center justify-center w-12 h-12 rounded-full bg-zinc-800 text-white shadow-lg hover:bg-zinc-700 transition-all duration-300 ease-in-out opacity-90 hover:opacity-100"
                        aria-label="위로가기"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
                        </svg>
                    </button>
                </>
            )}
        </section>
    );
};
