import { useThemeStyle } from "../../../../hooks/useThemeStyle";
import { FcOpenedFolder } from "react-icons/fc";
import { FiFileText } from "react-icons/fi";
import { CiSquareRemove } from "react-icons/ci";
import { MdHistory, MdClearAll } from "react-icons/md";
import { useTranslation } from "react-i18next";
import { useSearch } from "./useSearch";
import { HighlightedText } from "./HighlightedText";

const LISTBOX_ID = "search-results-listbox";

export const Search = () => {
    const { backgroundStyle, backgroundClass } = useThemeStyle();
    const { t } = useTranslation();
    const {
        query,
        setQuery,
        setDebouncedQuery,
        isDebouncing,
        activeIndex,
        setActiveIndex,
        searchHistory,
        setShowSearchHistory,
        recentPaths,
        inputRef,
        persistRecents,
        results,
        blogResults,
        keywords,
        searchableRoutes,
        selectedPathState,
        showResults,
        hasAnyResults,
        showRecents,
        shouldShowSearchHistory,
        totalCount,
        openRoute,
        openBlogPost,
        handleKeyDown,
    } = useSearch();

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
                        aria-controls={LISTBOX_ID}
                        aria-activedescendant={showResults ? `search-option-${activeIndex}` : undefined}
                    />
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
                    id={LISTBOX_ID}
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
                                                    <div className="flex items-center gap-1.5 min-w-0">
                                                        <FiFileText className="w-3.5 h-3.5 shrink-0 text-blue-400/70" />
                                                        <span className="truncate font-medium">
                                                            <HighlightedText text={post.title} keywords={keywords} />
                                                        </span>
                                                    </div>

                                                    {post.snippet && (
                                                        <p className="pl-5 mt-0.5 text-[10px] text-white/45 leading-relaxed line-clamp-2">
                                                            <HighlightedText text={post.snippet} keywords={keywords} />
                                                        </p>
                                                    )}

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
