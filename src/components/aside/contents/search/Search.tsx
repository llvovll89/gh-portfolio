import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import { NOT_FOUND, routesPath } from "../../../../routes/route";
import { NavigationContext } from "../../../../context/NavigationContext";
import { useThemeStyle } from "../../../../hooks/useThemeStyle";
import { FcOpenedFolder } from "react-icons/fc";
import { FiFileText } from "react-icons/fi";
import { useHandlePushPath } from "../../../../hooks/useHandlePushPath";
import { CiSquareRemove } from "react-icons/ci";
import { MdHistory, MdClearAll } from "react-icons/md";
import { useTranslation } from "react-i18next";
import { loadPosts } from "../../../../utils/loadPosts";
import type { BlogPost } from "../../../../utils/loadPosts";

const RECENT_STORAGE_KEY = "gh-portfolio:search-recent-paths";
const FREQUENCY_STORAGE_KEY = "gh-portfolio:search-frequency";
const SEARCH_HISTORY_KEY = "gh-portfolio:search-history";
const MAX_RESULTS = 20;
const MAX_RECENTS = 8;
const MAX_SEARCH_HISTORY = 5;
const MAX_BLOG_RESULTS = 10;

type RouteItem = (typeof routesPath)[number];

// ── 한국어 초성 추출 ─────────────────────────────────────────
const CHO = ["ㄱ","ㄲ","ㄴ","ㄷ","ㄸ","ㄹ","ㅁ","ㅂ","ㅃ","ㅅ","ㅆ","ㅇ","ㅈ","ㅉ","ㅊ","ㅋ","ㅌ","ㅍ","ㅎ"];

function getChosung(str: string): string {
    return [...str]
        .map((ch) => {
            const code = ch.charCodeAt(0) - 0xac00;
            if (code < 0 || code > 11171) return ch;
            return CHO[Math.floor(code / 588)];
        })
        .join("");
}

function isChosungOnly(str: string): boolean {
    return [...str].every((ch) => CHO.includes(ch));
}

// 초성 검색: 쿼리가 전부 초성이면 초성끼리 매칭
function chosungMatch(text: string, query: string): boolean {
    if (!isChosungOnly(query)) return false;
    const textChosung = getChosung(text.toLowerCase());
    return textChosung.includes(query);
}

// ── 텍스트 유틸 ──────────────────────────────────────────────
function normalizeQuery(q: string) {
    return q.trim().replace(/\s+/g, " ");
}

function getKeywords(q: string) {
    const normalized = normalizeQuery(q).toLowerCase();
    if (!normalized) return [];
    return normalized.split(" ").filter(Boolean);
}

// 마크다운 문법 제거 (스니펫용)
function stripMarkdown(text: string): string {
    return text
        .replace(/```[\s\S]*?```/g, "")
        .replace(/`[^`]+`/g, "")
        .replace(/!\[.*?\]\(.*?\)/g, "")
        .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
        .replace(/^#{1,6}\s+/gm, "")
        .replace(/[*_~>|]/g, "")
        .replace(/\n+/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}

// 본문에서 키워드 주변 스니펫 추출
function extractSnippet(body: string, keywords: string[], maxLen = 90): string | null {
    const stripped = stripMarkdown(body);
    const lower = stripped.toLowerCase();
    for (const k of keywords) {
        const idx = lower.indexOf(k.toLowerCase());
        if (idx >= 0) {
            const start = Math.max(0, idx - 20);
            const end = Math.min(stripped.length, idx + k.length + 60);
            let snippet = stripped.slice(start, end);
            if (start > 0) snippet = "…" + snippet;
            if (end < stripped.length) snippet += "…";
            return snippet.slice(0, maxLen + 4);
        }
    }
    return null;
}

// ── 스코어링 ─────────────────────────────────────────────────
function scoreRoute(
    routeName: string,
    keywords: string[],
    fullQueryLower: string,
    frequencyMap: Record<string, number>,
    routePath: string,
) {
    const nameLower = routeName.toLowerCase();
    if (!keywords.length) return 0;

    let score = 0;
    let matchedCount = 0;

    if (nameLower === fullQueryLower) score += 200;
    if (nameLower.startsWith(fullQueryLower)) score += 120;

    for (const k of keywords) {
        if (!k) continue;
        const idx = nameLower.indexOf(k);
        if (idx >= 0) {
            matchedCount += 1;
            score += 20;
            if (idx === 0) score += 15;
            if (nameLower === k) score += 30;
        }
        // 초성 검색
        if (chosungMatch(routeName, k)) {
            matchedCount += 1;
            score += 15;
        }
    }

    if (matchedCount === keywords.length) score += 40;
    score += Math.max(0, 20 - routeName.length * 0.5);
    const frequency = frequencyMap[routePath] || 0;
    score += Math.min(frequency * 5, 100);

    return score;
}

function scoreBlogPost(
    post: BlogPost,
    keywords: string[],
    fullQueryLower: string,
): { score: number; snippet: string | null } {
    if (!keywords.length) return { score: 0, snippet: null };

    const titleLower = post.title.toLowerCase();
    const tagsStr = (post.tags ?? []).join(" ").toLowerCase();
    const summaryStr = (post.summary ?? "").toLowerCase();
    const bodyStripped = stripMarkdown(post.body).toLowerCase();

    let score = 0;

    if (titleLower === fullQueryLower) score += 160;
    if (titleLower.startsWith(fullQueryLower)) score += 90;

    for (const k of keywords) {
        if (titleLower.includes(k)) {
            score += 35;
            if (titleLower.startsWith(k)) score += 10;
        }
        // 초성 검색 (제목)
        if (chosungMatch(post.title, k)) score += 20;

        if (tagsStr.includes(k)) score += 25;
        if (summaryStr.includes(k)) score += 15;
        // 본문 검색
        if (bodyStripped.includes(k)) score += 8;
    }

    if (keywords.every((k) => titleLower.includes(k))) score += 30;
    if (keywords.every((k) => bodyStripped.includes(k))) score += 10;

    // 스니펫: 제목 → summary → 본문 순으로 우선
    let snippet: string | null = null;
    if (score > 0) {
        const bodyForSnippet = post.summary
            ? `${post.summary} ${post.body}`
            : post.body;
        snippet = extractSnippet(bodyForSnippet, keywords);
    }

    return { score, snippet };
}

// ── localStorage 헬퍼 ────────────────────────────────────────
function loadFrequency(): Record<string, number> {
    try {
        const raw = localStorage.getItem(FREQUENCY_STORAGE_KEY);
        if (!raw) return {};
        const parsed: unknown = JSON.parse(raw);
        if (typeof parsed !== "object" || parsed === null) return {};
        return parsed as Record<string, number>;
    } catch {
        return {};
    }
}

function saveFrequency(map: Record<string, number>) {
    try { localStorage.setItem(FREQUENCY_STORAGE_KEY, JSON.stringify(map)); } catch { /* ignore */ }
}

function incrementFrequency(path: string, map: Record<string, number>) {
    const next = { ...map, [path]: (map[path] || 0) + 1 };
    saveFrequency(next);
    return next;
}

function loadSearchHistory(): string[] {
    try {
        const raw = localStorage.getItem(SEARCH_HISTORY_KEY);
        if (!raw) return [];
        const parsed: unknown = JSON.parse(raw);
        if (!Array.isArray(parsed)) return [];
        return parsed.filter((x): x is string => typeof x === "string");
    } catch {
        return [];
    }
}

function saveSearchHistory(history: string[]) {
    try { localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(history)); } catch { /* ignore */ }
}

// ── 하이라이트 ───────────────────────────────────────────────
function escapeRegExp(s: string) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function HighlightedText({ text, keywords }: { text: string; keywords: string[] }) {
    const active = keywords.filter(Boolean);
    if (!active.length) return <>{text}</>;

    const sorted = [...active].sort((a, b) => b.length - a.length);
    const pattern = new RegExp(`(${sorted.map(escapeRegExp).join("|")})`, "ig");
    const parts = text.split(pattern);

    return (
        <>
            {parts.map((part, idx) => {
                const isHit = sorted.some((k) => k.toLowerCase() === part.toLowerCase());
                return isHit ? (
                    <mark key={idx} className="bg-primary/30 text-white px-0.5 rounded-sm">
                        {part}
                    </mark>
                ) : (
                    <span key={idx}>{part}</span>
                );
            })}
        </>
    );
}

// ── 컴포넌트 ─────────────────────────────────────────────────
export const Search = () => {
    const { selectedPathState, setSelectedNav } = useContext(NavigationContext);
    const { backgroundStyle, backgroundClass } = useThemeStyle();
    const handlePushPath = useHandlePushPath();
    const { t } = useTranslation();

    const [query, setQuery] = useState("");
    const [debouncedQuery, setDebouncedQuery] = useState("");
    const [isDebouncing, setIsDebouncing] = useState(false);
    const [activeIndex, setActiveIndex] = useState(0);
    const [frequencyMap, setFrequencyMap] = useState<Record<string, number>>(() => loadFrequency());
    const [searchHistory, setSearchHistory] = useState<string[]>(() => loadSearchHistory());
    const [showSearchHistory, setShowSearchHistory] = useState(false);
    const [recentPaths, setRecentPaths] = useState<string[]>(() => {
        try {
            const raw = localStorage.getItem(RECENT_STORAGE_KEY);
            if (!raw) return [];
            const parsed: unknown = JSON.parse(raw);
            if (!Array.isArray(parsed)) return [];
            return parsed.filter((x): x is string => typeof x === "string");
        } catch {
            return [];
        }
    });
    const inputRef = useRef<HTMLInputElement>(null);

    const persistRecents = (next: string[]) => {
        setRecentPaths(next);
        try { localStorage.setItem(RECENT_STORAGE_KEY, JSON.stringify(next)); } catch { /* ignore */ }
    };

    const pushRecent = (path: string) => {
        const next = [path, ...recentPaths.filter((p) => p !== path)].slice(0, MAX_RECENTS);
        persistRecents(next);
    };

    const addSearchHistory = (q: string) => {
        const trimmed = normalizeQuery(q);
        if (!trimmed) return;
        const next = [trimmed, ...searchHistory.filter((h) => h !== trimmed)].slice(0, MAX_SEARCH_HISTORY);
        setSearchHistory(next);
        saveSearchHistory(next);
    };

    // debounce
    useEffect(() => {
        setIsDebouncing(true);
        const timer = window.setTimeout(() => {
            setDebouncedQuery((prev) => {
                const next = normalizeQuery(query);
                if (prev !== next) setActiveIndex(0);
                return next;
            });
            setIsDebouncing(false);
        }, 180);
        return () => window.clearTimeout(timer);
    }, [query]);

    const keywords = useMemo(() => getKeywords(debouncedQuery), [debouncedQuery]);
    const searchableRoutes = useMemo(() => routesPath.filter((r) => r.path !== NOT_FOUND), []);
    const allPosts = useMemo(() => loadPosts(), []);

    const results: RouteItem[] = useMemo(() => {
        if (!keywords.length) return [];
        const fullQueryLower = debouncedQuery.toLowerCase();
        return searchableRoutes
            .map((r) => ({ route: r, score: scoreRoute(r.name, keywords, fullQueryLower, frequencyMap, r.path) }))
            .filter((x) => x.score > 0)
            .sort((a, b) => b.score - a.score)
            .slice(0, MAX_RESULTS)
            .map((x) => x.route);
    }, [debouncedQuery, keywords, searchableRoutes, frequencyMap]);

    const blogResults: (BlogPost & { snippet: string | null })[] = useMemo(() => {
        if (!keywords.length) return [];
        const fullQueryLower = debouncedQuery.toLowerCase();
        return allPosts
            .map((post) => {
                const { score, snippet } = scoreBlogPost(post, keywords, fullQueryLower);
                return { ...post, snippet, score };
            })
            .filter((x) => x.score > 0)
            .sort((a, b) => b.score - a.score)
            .slice(0, MAX_BLOG_RESULTS);
    }, [allPosts, debouncedQuery, keywords]);

    const listboxId = "search-results-listbox";

    const openRoute = (path: string) => {
        pushRecent(path);
        setFrequencyMap((prev) => incrementFrequency(path, prev));
        if (debouncedQuery.trim()) addSearchHistory(debouncedQuery);
        handlePushPath(path);
        setSelectedNav(null); // 모바일 바텀시트 닫기
    };

    const openBlogPost = (slug: string) => {
        if (debouncedQuery.trim()) addSearchHistory(debouncedQuery);
        handlePushPath(`/blog/${slug}`);
        setSelectedNav(null); // 모바일 바텀시트 닫기
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (showSearchHistory && searchHistory.length > 0) {
            if (e.key === "ArrowDown") { e.preventDefault(); setActiveIndex((p) => Math.min(p + 1, searchHistory.length - 1)); return; }
            if (e.key === "ArrowUp") { e.preventDefault(); setActiveIndex((p) => Math.max(p - 1, 0)); return; }
            if (e.key === "Enter") {
                e.preventDefault();
                const picked = searchHistory[activeIndex];
                if (picked) { setQuery(picked); setShowSearchHistory(false); }
                return;
            }
        }

        if (e.key === "Escape") {
            setQuery(""); setDebouncedQuery(""); setActiveIndex(0); setShowSearchHistory(false);
            inputRef.current?.focus();
            return;
        }

        const totalResults = results.length + blogResults.length;
        if (totalResults === 0) return;

        if (e.key === "ArrowDown") { e.preventDefault(); setActiveIndex((p) => Math.min(p + 1, totalResults - 1)); return; }
        if (e.key === "ArrowUp") { e.preventDefault(); setActiveIndex((p) => Math.max(p - 1, 0)); return; }
        if (e.key === "Enter") {
            e.preventDefault();
            if (activeIndex < results.length) {
                const picked = results[activeIndex];
                if (picked) openRoute(picked.path);
            } else {
                const blogIdx = activeIndex - results.length;
                const picked = blogResults[blogIdx];
                if (picked) openBlogPost(picked.slug);
            }
        }
    };

    const showResults = keywords.length > 0;
    const hasAnyResults = results.length > 0 || blogResults.length > 0;
    const showRecents = !showResults && !showSearchHistory && recentPaths.length > 0;
    const shouldShowSearchHistory =
        showSearchHistory && !showResults && searchHistory.length > 0 && query.trim() === "";

    const totalCount = results.length + blogResults.length;

    return (
        <section
            className={`w-full flex flex-col ${backgroundClass} overflow-hidden`}
            style={backgroundStyle}
        >
            <header className="w-full h-10 px-3 flex items-center text-xs text-white overflow-hidden tracking-[1px]">
                {t("search.title")}
            </header>

            {/* 검색 입력 */}
            <div className="w-full flex flex-col px-3 py-2 gap-1.5 bg-sub-gary/10">
                <div className="relative flex items-center">
                    <input
                        ref={inputRef}
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={handleKeyDown}
                        onFocus={() => {
                            if (!query.trim() && searchHistory.length > 0) {
                                setShowSearchHistory(true);
                                setActiveIndex(0);
                            }
                        }}
                        onBlur={() => { setTimeout(() => setShowSearchHistory(false), 200); }}
                        type="text"
                        placeholder={t("search.placeholder")}
                        className="focus:border-primary transition-all w-full h-7 bg-base-navy border border-sub-gary/30 rounded-sm px-2 pr-7 tracking-wide text-white outline-none text-xs"
                        autoFocus
                        role="combobox"
                        aria-expanded={showResults}
                        aria-controls={listboxId}
                        aria-activedescendant={showResults ? `search-option-${activeIndex}` : undefined}
                    />
                    {/* 입력 지우기 버튼 */}
                    {query && (
                        <button
                            onClick={() => { setQuery(""); setDebouncedQuery(""); inputRef.current?.focus(); }}
                            className="absolute right-1.5 text-white/40 hover:text-white transition-colors"
                            aria-label="검색어 지우기"
                        >
                            <CiSquareRemove className="w-4 h-4" />
                        </button>
                    )}
                </div>

                {/* 상태 표시 */}
                {showResults && (
                    <div className="text-[10px] text-white/40 px-0.5 flex items-center gap-1">
                        {isDebouncing ? (
                            <span className="animate-pulse">검색 중…</span>
                        ) : hasAnyResults ? (
                            <>
                                <span className="text-primary/70">{totalCount}</span>
                                <span>개 결과</span>
                                {blogResults.length > 0 && (
                                    <span className="text-white/30">
                                        · 페이지 {results.length} · 블로그 {blogResults.length}
                                    </span>
                                )}
                            </>
                        ) : (
                            <span>결과 없음</span>
                        )}
                    </div>
                )}
            </div>

            {/* 검색어 히스토리 */}
            {shouldShowSearchHistory && (
                <div className="w-full flex-1 p-2 text-white overflow-y-auto">
                    <div className="px-2 py-1 text-[11px] text-white/50 flex items-center gap-1">
                        <MdHistory />
                        {t("search.recentSearches")}
                    </div>
                    <ul className="flex flex-col gap-0.5">
                        {searchHistory.map((term, idx) => (
                            <li
                                key={idx}
                                onMouseEnter={() => setActiveIndex(idx)}
                                onClick={() => { setQuery(term); setShowSearchHistory(false); }}
                                className={[
                                    "w-full h-8 flex items-center px-3 text-white text-xs cursor-pointer gap-2 rounded-sm",
                                    "hover:bg-primary/20",
                                    idx === activeIndex ? "ring-1 ring-primary/40" : "",
                                ].join(" ")}
                            >
                                <MdHistory className="w-3.5 h-3.5 opacity-50 shrink-0" />
                                <span className="truncate">{term}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* 최근 방문 */}
            {showRecents && (
                <div className="w-full flex-1 p-2 text-white overflow-y-auto">
                    <div className="px-2 py-1 text-[11px] text-white/50 flex items-center justify-between">
                        <span>{t("search.recentVisits")}</span>
                        <button
                            onClick={() => persistRecents([])}
                            className="flex items-center gap-1 hover:text-primary transition-colors text-[10px]"
                            title={t("search.clearAll")}
                        >
                            <MdClearAll fontSize={14} />
                            {t("search.clearAll")}
                        </button>
                    </div>
                    <ul className="flex flex-col gap-0.5">
                        {recentPaths
                            .map((p) => searchableRoutes.find((r) => r.path === p))
                            .filter(Boolean)
                            .map((r) => (
                                <li
                                    key={r!.path}
                                    onClick={() => openRoute(r!.path)}
                                    className={[
                                        "w-full h-8 flex items-center px-3 text-white text-xs cursor-pointer gap-2 rounded-sm relative",
                                        "hover:bg-primary/20",
                                        selectedPathState.state === r!.path ? "bg-sub-gary/20" : "",
                                    ].join(" ")}
                                >
                                    <FcOpenedFolder className="w-4 h-4 shrink-0" />
                                    <span className="truncate flex-1">{r!.name}</span>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            persistRecents(recentPaths.filter((p) => p !== r!.path));
                                        }}
                                        className="text-white/30 hover:text-white/70 transition-colors"
                                        aria-label="최근 방문 삭제"
                                    >
                                        <CiSquareRemove className="w-4 h-4" />
                                    </button>
                                </li>
                            ))}
                    </ul>
                </div>
            )}

            {/* 검색 결과 */}
            {showResults && (
                <div
                    id={listboxId}
                    className="w-full flex-1 p-2 text-white overflow-y-auto"
                >
                    {!hasAnyResults && !isDebouncing ? (
                        <div className="px-3 py-4 text-sm text-white/50 text-center">
                            <div className="text-2xl mb-1">🔍</div>
                            <div>{t("search.noResults")}</div>
                            <div className="text-[11px] mt-1 text-white/30">다른 키워드로 검색해 보세요</div>
                        </div>
                    ) : (
                        <>
                            {/* 페이지 결과 */}
                            {results.length > 0 && (
                                <section>
                                    <div className="px-2 py-1 mb-1 text-[10px] text-white/40 uppercase tracking-widest flex items-center gap-1">
                                        <FcOpenedFolder className="w-3 h-3" />
                                        Pages
                                        <span className="ml-auto text-white/25 normal-case tracking-normal">{results.length}</span>
                                    </div>
                                    <ul role="listbox" aria-label={t("search.searchResults")} className="flex flex-col gap-0.5">
                                        {results.map((r, idx) => {
                                            const isActive = idx === activeIndex;
                                            return (
                                                <li
                                                    id={`search-option-${idx}`}
                                                    role="option"
                                                    aria-selected={isActive}
                                                    onMouseEnter={() => setActiveIndex(idx)}
                                                    onClick={() => openRoute(r.path)}
                                                    key={r.path}
                                                    className={[
                                                        "w-full h-8 flex items-center px-3 text-white text-xs cursor-pointer gap-2 rounded-sm",
                                                        "hover:bg-primary/20",
                                                        selectedPathState.state === r.path ? "bg-sub-gary/20" : "",
                                                        isActive ? "ring-1 ring-primary/40" : "",
                                                    ].join(" ")}
                                                >
                                                    <FcOpenedFolder className="w-4 h-4 shrink-0" />
                                                    <span className="truncate">
                                                        <HighlightedText text={r.name} keywords={keywords} />
                                                    </span>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </section>
                            )}

                            {/* 블로그 포스트 결과 */}
                            {blogResults.length > 0 && (
                                <section className={results.length > 0 ? "mt-3" : ""}>
                                    <div className="px-2 py-1 mb-1 text-[10px] text-white/40 uppercase tracking-widest flex items-center gap-1">
                                        <FiFileText className="w-3 h-3" />
                                        Blog Posts
                                        <span className="ml-auto text-white/25 normal-case tracking-normal">{blogResults.length}</span>
                                    </div>
                                    <ul className="flex flex-col gap-0.5">
                                        {blogResults.map((post, idx) => {
                                            const globalIdx = results.length + idx;
                                            const isActive = globalIdx === activeIndex;
                                            return (
                                                <li
                                                    id={`search-option-${globalIdx}`}
                                                    role="option"
                                                    aria-selected={isActive}
                                                    onMouseEnter={() => setActiveIndex(globalIdx)}
                                                    key={post.slug}
                                                    onClick={() => openBlogPost(post.slug)}
                                                    className={[
                                                        "w-full flex flex-col px-3 py-2 text-white text-xs cursor-pointer rounded-sm",
                                                        "hover:bg-primary/20",
                                                        isActive ? "ring-1 ring-primary/40" : "",
                                                    ].join(" ")}
                                                >
                                                    {/* 제목 */}
                                                    <div className="flex items-center gap-1.5 min-w-0">
                                                        <FiFileText className="w-3.5 h-3.5 shrink-0 text-blue-400/70" />
                                                        <span className="truncate font-medium">
                                                            <HighlightedText text={post.title} keywords={keywords} />
                                                        </span>
                                                    </div>

                                                    {/* 스니펫 (본문 미리보기) */}
                                                    {post.snippet && (
                                                        <p className="pl-5 mt-0.5 text-[10px] text-white/45 leading-relaxed line-clamp-2">
                                                            <HighlightedText text={post.snippet} keywords={keywords} />
                                                        </p>
                                                    )}

                                                    {/* 날짜 + 태그 */}
                                                    {(post.date || (post.tags?.length ?? 0) > 0) && (
                                                        <div className="flex items-center gap-2 pl-5 mt-0.5 text-[10px] text-white/30">
                                                            {post.date && <span>{post.date}</span>}
                                                            {post.tags?.slice(0, 3).map((tag) => (
                                                                <span key={tag} className="text-primary/50">#{tag}</span>
                                                            ))}
                                                        </div>
                                                    )}
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </section>
                            )}
                        </>
                    )}
                </div>
            )}
        </section>
    );
};
