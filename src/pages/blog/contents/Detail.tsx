import { uiText } from "../../../utils/uiText";
import {useMemo, useState, useEffect, useRef, useContext, lazy, Suspense} from "react";
import {useParams, Link, useNavigate} from "react-router-dom";
import {loadAllPosts, loadPost, type BlogPost} from "../../../utils/loadAllPosts";
import { useTranslation } from "react-i18next";
import {MarkdownRenderer} from "./MarkdownRender";
import {parseToc} from "../../../utils/parseToc";
import {getRelatedPosts} from "../../../utils/relatedPosts";
import {scrollToHeading} from "../../../utils/scrollToHeading";
import {isPlainLeftClick} from "../../../utils/isPlainLeftClick";
import {TableOfContents} from "./TableOfContents";
import {Minimap} from "./Minimap";
import {primeListViewCount} from "../../../utils/viewCounts";
import {LuArrowLeft, LuEye, LuChevronLeft, LuChevronRight} from "react-icons/lu";
import {logger} from "../../../utils/logger";
// Firestore SDK(~450KB)는 본문 렌더 후 별도 청크로 받도록 조회수·댓글을 지연 로드
const BlogComments = lazy(() => import("../comments/BlogComments").then(module => ({ default: module.BlogComments })));
import {useSeoMeta} from "../../../hooks/useSeoMeta";
import { FeedbackPage } from "../../../components/error/FeedbackPage";
import {ShareButton} from "../../../components/ShareButton";
import {Header} from "../../../components/header/Header";
import {Aside} from "../../../components/aside/Aside";
import {LayoutContext} from "../../../context/LayoutContext";
import {useCheckedMobileSize} from "../../../hooks/useCheckedMobileSize";

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

    const {layoutState} = useContext(LayoutContext);
    const isMobileSize = useCheckedMobileSize();
    const [showScrollButtons, setShowScrollButtons] = useState(false);
    const [viewCount, setViewCount] = useState<number | null>(null);
    const progressBarRef = useRef<HTMLDivElement>(null);


    const {prevPost, nextPost} = useMemo(() => {
        const idx = ALL_POSTS.findIndex((p) => p.slug === slug);
        // 존재하지 않는 slug(404)에서는 이전/다음 글을 노출하지 않음
        if (idx < 0) return {prevPost: null, nextPost: null};
        return {
            prevPost: idx < ALL_POSTS.length - 1 ? ALL_POSTS[idx + 1] : null,
            nextPost: idx > 0 ? ALL_POSTS[idx - 1] : null,
        };
    }, [slug]);

    const relatedPosts = useMemo(() => (metadata ? getRelatedPosts(metadata, ALL_POSTS) : []), [metadata]);

    const tocItems = useMemo(() => {
        if (!post) return [];
        // 본문에 직접 쓴 '목차' 제목은 사이드 목차와 중복되므로 제외
        return parseToc(post.body).filter(item => !/^(목차|table of contents|contents)$/i.test(item.text.trim()));
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

    // /blog/글#섹션 으로 진입(새 탭·공유 링크·새로고침)하면 본문이 비동기로 렌더된 뒤에 해당 섹션으로 이동
    useEffect(() => {
        if (!post || !window.location.hash) return;
        const rafId = requestAnimationFrame(() => { scrollToHeading(window.location.hash, DETAIL_SCROLL_ID); });
        return () => cancelAnimationFrame(rafId);
    }, [post]);

    // SEO 메타태그 업데이트 (title, og:title, og:description 등)
    useSeoMeta({
        title: metadata?.title,
        description: metadata?.summary,
        url: slug ? `/blog/${slug}` : undefined,
        // 없는 글(404)에는 빌드되지 않은 글 OG 이미지 대신 기본 이미지를 쓰도록 website 로 지정
        type: metadata ? "article" : "website",
        noIndex: !metadata,
        publishedTime: metadata?.date,
    });

    // 조회수 증가 + 실시간 구독
    useEffect(() => {
        if (!slug || !post) return;
        let active = true;
        let unsubscribe: (() => void) | undefined;
        import("../../../utils/blogViews").then(({ incrementViewCount, subscribeViewCount }) => {
            if (!active) return;
            incrementViewCount(slug).catch((e) => logger.error("조회수 증가 실패", e));
            unsubscribe = subscribeViewCount(slug, (count) => {
                setViewCount(count);
                primeListViewCount(slug, count);
            });
        }).catch((e) => logger.error("조회수 모듈 로드 실패", e));
        return () => {
            active = false;
            unsubscribe?.();
        };
    }, [slug, post]);

    const scrollToTop = () => {
        document
            .getElementById(DETAIL_SCROLL_ID)
            ?.scrollTo({
                top: 0,
                behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
            });
    };

    const goBack = () => { void navigate("/blog"); };

    // 플로팅 버튼: 모바일은 하단 내비 위, 데스크톱은 사이드바 오른쪽·상태바 위에 배치
    const floatingStyle = (side: "left" | "right"): React.CSSProperties => ({
        // 데스크톱 오른쪽은 테마 선택 버튼(fixed right-3 bottom-8)과 겹치지 않게 더 위로
        bottom: isMobileSize ? "calc(5.5rem + env(safe-area-inset-bottom))" : side === "right" ? 96 : 40,
        ...(side === "left" ? {left: (isMobileSize ? 0 : layoutState.resizeSidebarWidth) + 16} : {right: 24}),
    });

    // ← / → 키로 이전/다음 포스트 이동
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // 수정키 조합(Alt+← 뒤로가기 등), 입력·선택 요소, 코드 블록/스크롤 영역·대화상자 내부에서는 무시
            if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
            const target = e.target instanceof Element ? e.target : null;
            if (target?.closest("input, textarea, select, [contenteditable='true'], pre, [role='dialog'], [role='slider'], [role='tablist']")) return;
            if (e.key === "ArrowLeft" && prevPost)
                void navigate(`/blog/${prevPost.slug}`);
            if (e.key === "ArrowRight" && nextPost)
                void navigate(`/blog/${nextPost.slug}`);
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [prevPost, nextPost, navigate]);

    // Contents 와 같은 위치·크기(헤더 아래, 사이드바 오른쪽)의 자체 스크롤 컨테이너 — 로딩 화면과 본문이 공유
    const detailSectionClass = `absolute right-0 overflow-y-auto scrolls flex flex-col p-4 sm:p-6 md:py-10 md:px-15 bg-base-navy
                    ${isMobileSize ? "top-[69px] h-[calc(100dvh-69px)] pb-28" : "top-[68px] h-[calc(100dvh-92px)]"}`;
    const detailSectionStyle = {width: `calc(100% - ${isMobileSize ? 0 : layoutState.resizeSidebarWidth}px)`};

    if (!metadata) return <FeedbackPage kind="notFound" backTo="/blog" />;
    if (!post) {
        const failed = loaded?.error && loaded.slug === slug;
        if (failed) return <FeedbackPage kind="loadError" backTo="/blog" onRetry={() => setAttempt(value => value + 1)} />;
        // 본문 로딩 중에도 셸을 유지해 이전/다음 글 이동 시 헤더·사이드바가 깜빡이지 않게 함
        return (
            <>
                <Header />
                <Aside />
                <section id={DETAIL_SCROLL_ID} role="main" data-route-loading="true" tabIndex={-1} className={detailSectionClass} style={detailSectionStyle}>
                    <p role="status" className="text-foreground">{t("pages.blog.loadingPost")}</p>
                    <Link className="workbench-button mt-5 self-start" to="/blog">{t("feedback.backToList")}</Link>
                </section>
            </>
        );
    }

    return (
        <>
            {/* 다른 페이지와 같은 IDE 셸(헤더·사이드바·모바일 하단 내비) — 글을 연 뒤에도 다른 메뉴로 이동 가능 */}
            <Header />
            <Aside />
            {/* 읽기 진행도 바 (화면 최상단) */}
            <div className="fixed top-0 left-0 right-0 h-0.75 z-50 pointer-events-none">
                <div
                    ref={progressBarRef}
                    className="h-full bg-primary origin-left"
                    style={{transform: "scaleX(0)"}}
                />
            </div>

            {/*
             * Contents 와 같은 위치·크기(헤더 아래, 사이드바 오른쪽)의 자체 스크롤 컨테이너
             * - sticky TOC 가 올바르게 동작 (scroll container = 자기 자신)
             * - 모바일은 하단 내비에 가리지 않도록 아래 여백 확보
             */}
            <section
                id={DETAIL_SCROLL_ID}
                role="main" tabIndex={-1}
                className={detailSectionClass}
                style={detailSectionStyle}
            >
                <div className="mb-4 mx-auto w-full max-w-275">
                    <Link to="/blog" className="workbench-button">
                        <LuArrowLeft aria-hidden="true" />{t("routes.blog")}
                    </Link>
                </div>

                <header className="mb-6 mx-auto w-full max-w-275">
                    <div className="flex items-start justify-between gap-3 sm:gap-4">
                        <h1 lang="ko" className="max-w-[24em] break-keep text-[clamp(1.6rem,5vw,2.25rem)] font-bold leading-tight tracking-tight text-foreground">
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
                                className="rounded-md border border-line bg-panel text-foreground px-2 py-0.5 text-xs"
                            >
                                {t}
                            </span>
                        ))}
                    </div>

                    {post.summary ? (
                        <p
                            lang="ko"
                            className={`mt-3 max-w-[68ch] break-keep text-muted ${post.type === "html" ? "leading-tight" : "leading-7"}`}
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
                        // 스크립트·동일 출처는 계속 차단하고, 문서 안 target="_blank" 외부 링크만 새 탭으로 열리게 허용
                        sandbox="allow-popups allow-popups-to-escape-sandbox"
                    />
                ) : (
                    <>
                        {tocItems.length > 0 && (
                            <details className="xl:hidden mb-5 mx-auto w-full max-w-275 group rounded-[10px] border border-line bg-panel">
                                <summary className="cursor-pointer select-none marker:content-none [&::-webkit-details-marker]:hidden px-4 min-h-11 text-sm font-semibold text-muted flex items-center justify-between">
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
                                                    if (!isPlainLeftClick(e)) return;
                                                    e.preventDefault();
                                                    scrollToHeading(
                                                        item.id,
                                                        DETAIL_SCROLL_ID,
                                                    );
                                                }}
                                                className={`flex min-h-11 items-center text-sm leading-snug py-1.5 text-muted hover:text-foreground transition-colors ${
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
                        {/* 본문 줄 길이를 80자 안쪽으로 유지하기 위해 본문 열 최대 폭을 제한 */}
                        <div className="flex xl:gap-10 items-start mx-auto w-full max-w-275">
                            <div className="flex-1 min-w-0 max-w-190">
                                <MarkdownRenderer content={post.body} />
                                {/* 태그가 겹치는 관련 글 — 본문을 다 읽은 직후 다음 읽을거리 제시 */}
                                {relatedPosts.length > 0 && (
                                    <section aria-labelledby="related-posts-title" className="mt-10">
                                        <h2 id="related-posts-title" className="mb-3 text-base font-bold text-foreground">
                                            {uiText("관련 글")}
                                        </h2>
                                        <ul className="grid gap-3 sm:grid-cols-3">
                                            {relatedPosts.map((related) => (
                                                <li key={related.slug}>
                                                    <Link
                                                        to={`/blog/${related.slug}`}
                                                        className="group flex h-full flex-col gap-1.5 rounded-xl border border-line bg-panel p-4 transition-colors hover:border-primary/50"
                                                    >
                                                        <span lang="ko" className="line-clamp-2 text-sm font-semibold text-foreground group-hover:text-primary">
                                                            {related.title}
                                                        </span>
                                                        <time dateTime={related.date} className="mt-auto font-mono text-xs text-muted">
                                                            {related.date}
                                                        </time>
                                                    </Link>
                                                </li>
                                            ))}
                                        </ul>
                                    </section>
                                )}
                                <Suspense fallback={null}>
                                    <BlogComments slug={post.slug} />
                                </Suspense>
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
                            style={floatingStyle("left")}
                            className="fixed z-40 flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-panel text-foreground shadow-lg hover:bg-panel transition-all duration-300 ease-in-out opacity-90 hover:opacity-100"
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
                            style={floatingStyle("right")}
                            className="fixed z-40 flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-panel text-foreground shadow-lg hover:bg-panel transition-all duration-300 ease-in-out opacity-90 hover:opacity-100"
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
