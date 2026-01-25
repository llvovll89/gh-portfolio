import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import { NOT_FOUND, routesPath } from "../../../../routes/route";
import { GlobalStateContext } from "../../../../context/GlobalState.context";
import { FcOpenedFolder } from "react-icons/fc";
import { useHandlePushPath } from "../../../../hooks/useHandlePushPath";
import { CiSquareRemove } from "react-icons/ci";

const RECENT_STORAGE_KEY = "gh-portfolio:search-recent-paths";
const MAX_RESULTS = 20;
const MAX_RECENTS = 8;

type RouteItem = (typeof routesPath)[number];

function normalizeQuery(q: string) {
    return q.trim().replace(/\s+/g, " ");
}

function getKeywords(q: string) {
    const normalized = normalizeQuery(q).toLowerCase();
    if (!normalized) return [];
    return normalized.split(" ").filter(Boolean);
}

function scoreRoute(routeName: string, keywords: string[], fullQueryLower: string) {
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
            score += 20; // includes
            if (idx === 0) score += 15; // startsWith keyword
            if (nameLower === k) score += 30; // exact keyword
        }
    }

    // all-keywords match bonus (AND 느낌을 주되, OR도 남겨둠)
    if (matchedCount === keywords.length) score += 40;

    // 짧은 이름 약간 우대
    score += Math.max(0, 20 - routeName.length * 0.5);

    return score;
}

function escapeRegExp(s: string) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function HighlightedText({
    text,
    keywords,
}: {
    text: string;
    keywords: string[];
}) {
    const active = keywords.filter(Boolean);
    if (!active.length) return <>{text}</>;

    // 키워드가 여러 개면 긴 것부터 매칭(겹침 최소화)
    const sorted = [...active].sort((a, b) => b.length - a.length);
    const pattern = new RegExp(`(${sorted.map(escapeRegExp).join("|")})`, "ig");
    const parts = text.split(pattern);

    return (
        <>
            {parts.map((part, idx) => {
                const isHit = sorted.some(
                    (k) => k.toLowerCase() === part.toLowerCase(),
                );
                return isHit ? (
                    <mark
                        key={idx}
                        className="bg-primary/30 text-white px-0.5 rounded-sm"
                    >
                        {part}
                    </mark>
                ) : (
                    <span key={idx}>{part}</span>
                );
            })}
        </>
    );
}

export const Search = () => {
    const { selectedPathState, selectedTheme } = useContext(GlobalStateContext);
    const handlePushPath = useHandlePushPath();

    const [query, setQuery] = useState("");
    const [debouncedQuery, setDebouncedQuery] = useState("");
    const [activeIndex, setActiveIndex] = useState(0);
    const [recentPaths, setRecentPaths] = useState<string[]>(() => {
        try {
            if (typeof window === "undefined") return [];
            const raw = localStorage.getItem(RECENT_STORAGE_KEY);
            if (!raw) return [];
            const parsed: unknown = JSON.parse(raw);
            if (!Array.isArray(parsed)) return [];
            return parsed.filter((x): x is string => typeof x === "string");
        } catch {
            // ignore
            return [];
        }
    });
    const inputRef = useRef<HTMLInputElement>(null);

    const persistRecents = (next: string[]) => {
        setRecentPaths(next);
        try {
            localStorage.setItem(RECENT_STORAGE_KEY, JSON.stringify(next));
        } catch {
            // ignore
        }
    };

    const pushRecent = (path: string) => {
        const next = [path, ...recentPaths.filter((p) => p !== path)].slice(
            0,
            MAX_RECENTS,
        );
        persistRecents(next);
    };

    // debounce query
    useEffect(() => {
        const t = window.setTimeout(() => {
            setDebouncedQuery((prev) => {
                const next = normalizeQuery(query);
                if (prev !== next) {
                    setActiveIndex(0);
                }
                return next;
            });
        }, 200);

        return () => window.clearTimeout(t);
    }, [query]);

    const keywords = useMemo(() => getKeywords(debouncedQuery), [debouncedQuery]);

    const searchableRoutes = useMemo(
        () => routesPath.filter((r) => r.path !== NOT_FOUND),
        [],
    );

    const results: RouteItem[] = useMemo(() => {
        if (!keywords.length) return [];

        const fullQueryLower = debouncedQuery.toLowerCase();

        const scored = searchableRoutes
            .map((r) => ({
                route: r,
                score: scoreRoute(r.name, keywords, fullQueryLower),
            }))
            .filter((x) => x.score > 0)
            .sort((a, b) => b.score - a.score);

        return scored.slice(0, MAX_RESULTS).map((x) => x.route);
    }, [debouncedQuery, keywords, searchableRoutes]);

    const listboxId = "search-results-listbox";

    const openRoute = (path: string) => {
        pushRecent(path);
        handlePushPath(path);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Escape") {
            setQuery("");
            setDebouncedQuery("");
            setActiveIndex(0);
            inputRef.current?.focus();
            return;
        }

        if (results.length === 0) return;

        if (e.key === "ArrowDown") {
            e.preventDefault();
            setActiveIndex((prev) => Math.min(prev + 1, results.length - 1));
            return;
        }

        if (e.key === "ArrowUp") {
            e.preventDefault();
            setActiveIndex((prev) => Math.max(prev - 1, 0));
            return;
        }

        if (e.key === "Enter") {
            e.preventDefault();
            const picked = results[activeIndex];
            if (picked) openRoute(picked.path);
        }
    };

    const showResults = keywords.length > 0;
    const showRecents = !showResults && recentPaths.length > 0;

    const handleDelete = (e: React.MouseEvent, path: string) => {
        e.preventDefault();
        e.stopPropagation();

        const storage = localStorage.getItem(RECENT_STORAGE_KEY);
        if (!storage) return;

        const raw = JSON.parse(storage) as string[];
        const filtered = raw.filter((p) => p !== path);
        persistRecents(filtered);
    };

    return (
        <section
            className={`w-[calc(100%-40px)] flex flex-col ${selectedTheme.mode} overflow-hidden`}
        >
            <header className="w-full h-10 px-3 flex items-center text-xs text-white overflow-hidden tracking-[1px]">
                검색
            </header>

            <div className="w-full flex h-10 bg-sub-gary/20 items-center px-3">
                <input
                    ref={inputRef}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    type="text"
                    placeholder="검색어를 입력하세요"
                    className="focus:border-primary transition-all w-full h-7 bg-base-navy border border-sub-gary/30 rounded-sm px-2 tracking-wide text-white outline-none text-xs"
                    autoFocus
                    role="combobox"
                    aria-expanded={showResults}
                    aria-controls={listboxId}
                    aria-activedescendant={
                        showResults ? `search-option-${activeIndex}` : undefined
                    }
                />
            </div>

            {/* 최근 방문 */}
            {showRecents && (
                <div onContextMenu={(e) => {
                    e.preventDefault();
                }} className="w-full h-[calc(100%-80px)] p-2 text-white overflow-y-auto">
                    <div className="px-2 py-1 text-[11px] text-white/70">
                        최근 방문
                    </div>
                    <ul className="flex flex-col gap-1">
                        {recentPaths
                            .map((p) =>
                                searchableRoutes.find((r) => r.path === p),
                            )
                            .filter(Boolean)
                            .map((r) => (
                                <li
                                    key={r!.path}
                                    onClick={() => openRoute(r!.path)}
                                    className={`${selectedPathState.state === r!.path
                                        ? "bg-sub-gary/20"
                                        : ""
                                        } w-full h-8 flex items-center px-3 text-white text-sm cursor-pointer hover:bg-primary/20 gap-1 rounded-sm relative`}
                                >
                                    <FcOpenedFolder className="w-5 h-5" />
                                    {r!.name}

                                    <button onClick={(e) => handleDelete(e, r!.path)} className="delete_btn cursor-pointer rounded-sm absolute right-2">
                                        <CiSquareRemove fontSize={20} />
                                    </button>
                                </li>
                            ))}
                    </ul>
                </div>
            )}

            {/* 검색 결과 */}
            {showResults && (
                <div className="w-full h-[calc(100%-80px)] p-2 text-white overflow-y-auto">
                    {results.length === 0 ? (
                        <div className="px-3 py-2 text-sm text-white/70">
                            검색 결과가 없습니다.
                        </div>
                    ) : (
                        <ul
                            id={listboxId}
                            role="listbox"
                            aria-label="검색 결과"
                            className="flex flex-col gap-1"
                        >
                            {results.map((r, idx) => {
                                const isActive = idx === activeIndex;
                                const isSelected =
                                    selectedPathState.state === r.path;

                                return (
                                    <li
                                        id={`search-option-${idx}`}
                                        role="option"
                                        aria-selected={isActive}
                                        onMouseEnter={() => setActiveIndex(idx)}
                                        onClick={() => openRoute(r.path)}
                                        key={r.path}
                                        className={[
                                            "w-full h-8 flex items-center px-3 text-white text-sm cursor-pointer gap-1 rounded-sm",
                                            "hover:bg-primary/20",
                                            isSelected ? "bg-sub-gary/20" : "",
                                            isActive ? "ring-1 ring-primary/40" : "",
                                        ].join(" ")}
                                    >
                                        <FcOpenedFolder className="w-5 h-5" />
                                        <span className="truncate">
                                            <HighlightedText
                                                text={r.name}
                                                keywords={keywords}
                                            />
                                        </span>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </div>
            )}
        </section>
    );
};