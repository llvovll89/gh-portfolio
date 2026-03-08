import { useMemo, useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { loadAllPosts } from "../../../utils/loadAllPosts";
import { MarkdownRenderer } from "./MarkdownRender";
import { parseToc } from "../../../utils/parseToc";
import { TableOfContents } from "./TableOfContents";
import { Minimap } from "./Minimap";
import { incrementViewCount, subscribeViewCount } from "../../../utils/blogViews";
import { FiEye } from "react-icons/fi";
import { BlogComments } from "../comments/BlogComments";

// 빌드 타임에 결정되는 정적 데이터 — slug가 바뀔 때마다 재호출 방지
const ALL_POSTS = loadAllPosts();

// Detail 페이지 전용 스크롤 컨테이너 ID
export const DETAIL_SCROLL_ID = "detail-content";

export const Detail = () => {
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();

    const [showScrollButtons, setShowScrollButtons] = useState(false);
    const [readProgress, setReadProgress] = useState(0);
    const [viewCount, setViewCount] = useState<number | null>(null);

    const post = useMemo(() => {
        return ALL_POSTS.find((p) => p.slug === slug);
    }, [slug]);

    const tocItems = useMemo(() => {
        if (!post) return [];
        return parseToc(post.body);
    }, [post]);

    // detail-content 자체가 스크롤 컨테이너 (h-dvh overflow-y-auto)
    useEffect(() => {
        const container = document.getElementById(DETAIL_SCROLL_ID);
        if (!container) return;

        const handleScroll = () => {
            const { scrollTop, scrollHeight, clientHeight } = container;
            setShowScrollButtons(scrollTop > 300);
            const total = scrollHeight - clientHeight;
            setReadProgress(total > 0 ? Math.min(100, (scrollTop / total) * 100) : 0);
        };

        container.addEventListener("scroll", handleScroll);
        return () => container.removeEventListener("scroll", handleScroll);
    }, []);

    // 페이지 타이틀 업데이트
    useEffect(() => {
        if (post) {
            document.title = `${post.title} | GH Portfolio`;
            return () => { document.title = "Geon Ho Kim"; };
        }
    }, [post]);

    // 조회수 증가 + 실시간 구독
    useEffect(() => {
        if (!slug) return;
        incrementViewCount(slug).catch(console.error);
        const unsubscribe = subscribeViewCount(slug, setViewCount);
        return unsubscribe;
    }, [slug]);

    const scrollToTop = () => {
        document.getElementById(DETAIL_SCROLL_ID)?.scrollTo({ top: 0, behavior: "smooth" });
    };

    const goBack = () => navigate("/blog");

    if (!slug) {
        return (
            <div className="py-6">
                <p className="text-zinc-700 dark:text-zinc-300">잘못된 접근입니다.</p>
                <Link className="mt-3 inline-block underline underline-offset-4" to="/blog">
                    목록으로
                </Link>
            </div>
        );
    }

    if (!post) {
        return (
            <div className="py-6">
                <p className="text-zinc-700 dark:text-zinc-300">글을 찾을 수 없습니다: {slug}</p>
                <Link className="mt-3 inline-block underline underline-offset-4" to="/blog">
                    목록으로
                </Link>
            </div>
        );
    }

    return (
        <>
            {/* 읽기 진행도 바 - Detail 페이지는 헤더 없으므로 top-0 */}
            <div className="fixed top-0 left-0 right-0 h-[3px] z-50 pointer-events-none">
                <div
                    className="h-full bg-primary transition-all duration-100 ease-linear"
                    style={{ width: `${readProgress}%` }}
                />
            </div>

            {/*
             * h-dvh + overflow-y-auto: 이 section 자체를 스크롤 컨테이너로 만들어
             * - sticky TOC가 올바르게 동작 (scroll container = 자기 자신)
             * - App root section의 overflow-y:auto 간섭 없음
             */}
            <section
                id={DETAIL_SCROLL_ID}
                className="w-full h-dvh overflow-y-auto scrolls flex flex-col md:py-10 md:px-15 p-4"
            >
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
                        {viewCount !== null && (
                            <>
                                <span className="text-zinc-400 dark:text-zinc-600">•</span>
                                <span className="flex items-center gap-1 text-[clamp(0.75rem,1.5vw,0.9rem)] text-zinc-600 dark:text-zinc-400">
                                    <FiEye className="w-3 h-3" />
                                    {viewCount.toLocaleString()}
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
                        <p className={`mt-2 text-zinc-800 ${post.type === "html" ? "leading-tight" : "leading-7"}`}>{post.summary}</p>
                    ) : null}
                </header>

                {/* 본문 + TOC 사이드바 */}
                {post.type === "html" ? (
                    <iframe
                        srcDoc={post.body}
                        className="w-full rounded-lg border border-zinc-200 dark:border-zinc-700"
                        style={{ height: "80vh" }}
                        title={post.title}
                        sandbox=""
                    />
                ) : (
                    <>
                        <div className="flex xl:gap-10 items-start">
                            <div className="flex-1 min-w-0">
                                <MarkdownRenderer content={post.body} />
                                <BlogComments slug={slug} />
                            </div>
                            {tocItems.length > 0 && <TableOfContents items={tocItems} />}
                        </div>
                        <Minimap content={post.body} scrollContainerId={DETAIL_SCROLL_ID} />
                    </>
                )}

                {/* 플로팅 버튼 */}
                {showScrollButtons && (
                    <>
                        <button
                            onClick={goBack}
                            className="fixed left-6 bottom-6 z-50 flex items-center justify-center w-12 h-12 rounded-full bg-zinc-800 text-white shadow-lg hover:bg-zinc-700 transition-all duration-300 ease-in-out opacity-90 hover:opacity-100"
                            aria-label="뒤로가기"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                            </svg>
                        </button>

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
        </>
    );
};
