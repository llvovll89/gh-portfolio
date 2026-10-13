import { uiText } from "../../../utils/uiText";
import {useMemo, useState, useEffect, useRef} from "react";
import {useParams, Link, useNavigate} from "react-router-dom";
import {loadAllPosts, loadPost, type BlogPost} from "../../../utils/loadAllPosts";
import { useTranslation } from "react-i18next";
import {MarkdownRenderer} from "./MarkdownRender";
import {parseToc} from "../../../utils/parseToc";
import {scrollToHeading} from "../../../utils/scrollToHeading";
import {TableOfContents} from "./TableOfContents";
import {Minimap} from "./Minimap";
import {incrementViewCount, subscribeViewCount} from "../../../utils/blogViews";
import {LuEye, LuChevronLeft, LuChevronRight} from "react-icons/lu";
import {logger} from "../../../utils/logger";
import {BlogComments} from "../comments/BlogComments";
import {useSeoMeta} from "../../../hooks/useSeoMeta";
import { FeedbackPage } from "../../../components/error/FeedbackPage";
import {ShareButton} from "../../../components/ShareButton";

// 빌드 타임에 결정되는 정적 데이터 — slug가 바뀔 때마다 재호출 방지
const ALL_POSTS = loadAllPosts();

// Detail 페이지 전용 스크롤 컨테이너 ID
export const DETAIL_SCROLL_ID = "detail-content";

export const Detail = () => {
    const {slug} = useParams<{slug: string}>();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [loaded, setLoaded] = useState<{ slug: string; post?: BlogPost; error?: boolean } | null>(null);
    const [attempt, setAttempt] = useState(0);
    const metadata = ALL_POSTS.find(item => item.slug === slug);
    const post = loaded && loaded.slug === slug ? loaded.post : undefined;
    useEffect(() => {
        if (!slug || !metadata) return;
        let active = true;
        loadPost(slug).then(post => { if (active) setLoaded({ slug, post }); })
            .catch(() => { if (active) setLoaded({ slug, error: true }); });
        return () => { active = false; };
    }, [slug, metadata, attempt]);

    const [showScrollButtons, setShowScrollButtons] = useState(false);
    const [viewCount, setViewCount] = useState<number | null>(null);
    const progressBarRef = useRef<HTMLDivElement>(null);


    const {prevPost, nextPost} = useMemo(() => {
        const idx = ALL_POSTS.findIndex((p) => p.slug === slug);
        return {
            prevPost: idx < ALL_POSTS.length - 1 ? ALL_POSTS[idx + 1] : null,
            nextPost: idx > 0 ? ALL_POSTS[idx - 1] : null,
        };
    }, [slug]);

    const tocItems = useMemo(() => {
        if (!post) return [];
        return parseToc(post.body);
    }, [post]);

    // detail-content 자체가 스크롤 컨테이너 (h-dvh overflow-y-auto)
    useEffect(() => {
        const container = document.getElementById(DETAIL_SCROLL_ID);
        if (!container) return;

        let rafId: number | null = null;

        const handleScroll = () => {
            if (rafId !== null) return;
            rafId = requestAnimationFrame(() => {
                rafId = null;
                const {scrollTop, scrollHeight, clientHeight} = container;
                setShowScrollButtons(scrollTop > 300);
                const total = scrollHeight - clientHeight;
                const progress = total > 0 ? Math.min(1, scrollTop / total) : 0;
                if (progressBarRef.current) {
                    progressBarRef.current.style.transform = `scaleX(${progress})`;
                }
            });
        };

        container.addEventListener("scroll", handleScroll, {passive: true});
        return () => {
            container.removeEventListener("scroll", handleScroll);
            if (rafId !== null) cancelAnimationFrame(rafId);
        };
    }, [post]);

    // SEO 메타태그 업데이트 (title, og:title, og:description 등)
    useSeoMeta({
        title: metadata?.title,
        description: metadata?.summary,
        url: slug ? `/blog/${slug}` : undefined,
        type: "article",
        noIndex: !metadata,
        publishedTime: metadata?.date,
    });

    // 조회수 증가 + 실시간 구독
    useEffect(() => {
        if (!slug || !post) return;
        incrementViewCount(slug).catch((e) =>
            logger.error("조회수 증가 실패", e),
        );
        const unsubscribe = subscribeViewCount(slug, setViewCount);
        return unsubscribe;
    }, [slug, post]);

    const scrollToTop = () => {
        document
            .getElementById(DETAIL_SCROLL_ID)
            ?.scrollTo({top: 0, behavior: "smooth"});
    };

    const goBack = () => navigate("/blog");

    // ← / → 키로 이전/다음 포스트 이동
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (
                e.target instanceof HTMLInputElement ||
                e.target instanceof HTMLTextAreaElement
            )
                return;
            if (e.key === "ArrowLeft" && prevPost)
                navigate(`/blog/${prevPost.slug}`);
            if (e.key === "ArrowRight" && nextPost)
                navigate(`/blog/${nextPost.slug}`);
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [prevPost, nextPost, navigate]);

    if (!metadata) return <FeedbackPage kind="notFound" backTo="/blog" />;
    if (!post) {
        const failed = loaded?.error && loaded.slug === slug;
        if (failed) return <FeedbackPage kind="loadError" backTo="/blog" onRetry={() => setAttempt(value => value + 1)} />;
        return <main id="main-content" data-route-loading="true" tabIndex={-1} className="min-h-dvh bg-base-navy p-6 text-foreground"><p role="status">{t("pages.blog.loadingPost")}</p><Link className="workbench-button mt-5" to="/blog">{t("feedback.backToList")}</Link></main>;
    }

    return (
        <>
            {/* 읽기 진행도 바 - Detail 페이지는 헤더 없으므로 top-0 */}
            <div className="fixed top-0 left-0 right-0 h-0.75 z-50 pointer-events-none">
                <div
                    ref={progressBarRef}
                    className="h-full bg-primary origin-left"
                    style={{transform: "scaleX(0)"}}
                />
            </div>

            {/*
             * h-dvh + overflow-y-auto: 이 section 자체를 스크롤 컨테이너로 만들어
             * - sticky TOC가 올바르게 동작 (scroll container = 자기 자신)
             * - App root section의 overflow-y:auto 간섭 없음
             */}
            <section
                id={DETAIL_SCROLL_ID}
                role="main" tabIndex={-1}
                className="w-full h-dvh overflow-y-auto scrolls flex flex-col p-4 sm:p-6 md:py-10 md:px-15 bg-base-navy"
            >
                <div className="mb-4">
                    <Link
                        to="/blog"
                        className="text-sm underline underline-offset-4 text-muted hover:text-foreground transition-colors"
                    >
                        ← Posts
                    </Link>
                </div>

                <header className="mb-6">
                    <div className="flex items-start justify-between gap-3 sm:gap-4">
                        <h1 className="text-[clamp(1.5rem,5vw,2.25rem)] font-extrabold tracking-tight text-foreground">
                            {post.title}
                        </h1>
                        <div className="shrink-0 pt-1">
                            <ShareButton
                                title={post.title}
                                summary={post.summary}
                                url={`/blog/${slug}`}
                            />
                        </div>
                    </div>

                    <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm select-none text-muted">
                        <span className="text-[clamp(0.75rem,1.5vw,0.9rem)]">
                            {post.date || uiText("날짜 없음")}
                        </span>
                        {post.readingTime && (
                            <>
                                <span className="text-muted">•</span>
                                <span className="text-[clamp(0.75rem,1.5vw,0.9rem)]">
                                    {t("pages.blog.readingMinutes", { count: parseInt(post.readingTime, 10) })}
                                </span>
                            </>
                        )}
                        {viewCount !== null && (
                            <>
                                <span className="text-muted">•</span>
                                <span className="flex items-center gap-1 text-[clamp(0.75rem,1.5vw,0.9rem)]">
                                    <LuEye className="w-3 h-3" />
                                    {viewCount.toLocaleString()}
                                </span>
                            </>
                        )}
                        {post.tags?.map((t) => (
                            <span
                                key={t}
                                className="rounded-full border border-line bg-panel text-foreground px-2 py-0.5 text-xs"
                            >
                                {t}
                            </span>
                        ))}
                    </div>

                    {post.summary ? (
                        <p
                            className={`mt-2 text-muted ${post.type === "html" ? "leading-tight" : "leading-7"}`}
                        >
                            {post.summary}
                        </p>
                    ) : null}
                </header>

                {/* 본문 + TOC 사이드바 */}
                {post.type === "html" ? (
                    <iframe
                        srcDoc={post.body}
                        loading="lazy"
                        className="w-full rounded-lg border border-line dark:border-line h-[70vh] sm:h-[80vh]"
                        title={post.title}
                        sandbox=""
                    />
                ) : (
                    <>
                        {tocItems.length > 0 && (
                            <details className="xl:hidden mb-5 group rounded-lg border border-line bg-panel">
                                <summary className="cursor-pointer select-none marker:content-none [&::-webkit-details-marker]:hidden px-4 py-2.5 text-sm font-semibold text-muted flex items-center justify-between">
                                    {uiText("목차")}<svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        strokeWidth={2}
                                        stroke="currentColor"
                                        className="w-4 h-4 transition-transform duration-200 group-open:rotate-180"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                                        />
                                    </svg>
                                </summary>
                                <ul className="px-4 pb-3 pt-1 space-y-1 max-h-64 overflow-y-auto scrolls border-t border-line/60">
                                    {tocItems.map((item) => (
                                        <li key={item.id}>
                                            <a
                                                href={`#${item.id}`}
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    scrollToHeading(
                                                        item.id,
                                                        DETAIL_SCROLL_ID,
                                                    );
                                                }}
                                                className={`block text-sm leading-snug py-1.5 text-muted hover:text-foreground transition-colors ${
                                                    item.level === 3
                                                        ? "pl-4"
                                                        : "pl-0"
                                                }`}
                                            >
                                                {item.text}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </details>
                        )}
                        <div className="flex xl:gap-10 items-start">
                            <div className="flex-1 min-w-0">
                                <MarkdownRenderer content={post.body} />
                                <BlogComments slug={post.slug} />
                                {/* 이전/다음 포스트 네비게이션 */}
                                {(prevPost || nextPost) && (
                                    <nav
                                        aria-label={uiText("포스트 네비게이션")}
                                        className="mt-10 pt-8 border-t border-line grid grid-cols-2 gap-4"
                                    >
                                        {prevPost ? (
                                            <Link
                                                to={`/blog/${prevPost.slug}`}
                                                className="group flex flex-col gap-1 p-4 rounded-xl border border-line hover:border-line bg-panel hover:bg-panel transition-all"
                                            >
                                                <span className="flex items-center gap-1 text-xs text-muted group-hover:text-muted">
                                                    <LuChevronLeft className="w-3 h-3" />{" "}
                                                    {uiText("이전 글")}</span>
                                                <span className="text-sm text-muted group-hover:text-foreground line-clamp-2 transition-colors">
                                                    {prevPost.title}
                                                </span>
                                            </Link>
                                        ) : (
                                            <div />
                                        )}
                                        {nextPost ? (
                                            <Link
                                                to={`/blog/${nextPost.slug}`}
                                                className="group flex flex-col gap-1 p-4 rounded-xl border border-line hover:border-line bg-panel hover:bg-panel transition-all text-right"
                                            >
                                                <span className="flex items-center justify-end gap-1 text-xs text-muted group-hover:text-muted">
                                                    {uiText("다음 글")}{" "}
                                                    <LuChevronRight className="w-3 h-3" />
                                                </span>
                                                <span className="text-sm text-muted group-hover:text-foreground line-clamp-2 transition-colors">
                                                    {nextPost.title}
                                                </span>
                                            </Link>
                                        ) : (
                                            <div />
                                        )}
                                    </nav>
                                )}
                            </div>
                            {tocItems.length > 0 && (
                                <TableOfContents items={tocItems} />
                            )}
                        </div>
                        <Minimap
                            content={post.body}
                            scrollContainerId={DETAIL_SCROLL_ID}
                        />
                    </>
                )}

                {/* 플로팅 버튼 */}
                {showScrollButtons && (
                    <>
                        <button
                            onClick={goBack}
                            className="fixed left-4 sm:left-6 bottom-[max(1.5rem,env(safe-area-inset-bottom))] z-50 flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-panel text-foreground shadow-lg hover:bg-panel transition-all duration-300 ease-in-out opacity-90 hover:opacity-100"
                            aria-label={uiText("뒤로가기")}
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={2}
                                stroke="currentColor"
                                className="w-6 h-6"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
                                />
                            </svg>
                        </button>

                        <button
                            onClick={scrollToTop}
                            className="fixed right-4 sm:right-6 bottom-[max(1.5rem,env(safe-area-inset-bottom))] z-50 flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-panel text-foreground shadow-lg hover:bg-panel transition-all duration-300 ease-in-out opacity-90 hover:opacity-100"
                            aria-label={uiText("위로가기")}
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={2}
                                stroke="currentColor"
                                className="w-6 h-6"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M4.5 15.75l7.5-7.5 7.5 7.5"
                                />
                            </svg>
                        </button>
                    </>
                )}
            </section>
        </>
    );
};
