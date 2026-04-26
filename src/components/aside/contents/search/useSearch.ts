import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import { NOT_FOUND, routesPath } from "../../../../routes/route";
import { NavigationContext } from "../../../../context/NavigationContext";
import { useHandlePushPath } from "../../../../hooks/useHandlePushPath";
import { loadPosts } from "../../../../utils/loadPosts";
import type { BlogPost } from "../../../../utils/loadPosts";
import {
    normalizeQuery,
    getKeywords,
    scoreRoute,
    scoreBlogPost,
    loadFrequency,
    saveSearchHistory,
    incrementFrequency,
    loadSearchHistory,
    MAX_RESULTS,
    MAX_RECENTS,
    MAX_SEARCH_HISTORY,
    MAX_BLOG_RESULTS,
    RECENT_STORAGE_KEY,
} from "./searchUtils";

type RouteItem = (typeof routesPath)[number];

export function useSearch() {
    const { selectedPathState, setSelectedNav } = useContext(NavigationContext);
    const handlePushPath = useHandlePushPath();

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

    const openRoute = (path: string) => {
        pushRecent(path);
        setFrequencyMap((prev) => incrementFrequency(path, prev));
        if (debouncedQuery.trim()) addSearchHistory(debouncedQuery);
        handlePushPath(path);
        setSelectedNav(null);
    };

    const openBlogPost = (slug: string) => {
        if (debouncedQuery.trim()) addSearchHistory(debouncedQuery);
        handlePushPath(`/blog/${slug}`);
        setSelectedNav(null);
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

    return {
        query,
        setQuery,
        debouncedQuery,
        setDebouncedQuery,
        isDebouncing,
        activeIndex,
        setActiveIndex,
        searchHistory,
        showSearchHistory,
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
    };
}
