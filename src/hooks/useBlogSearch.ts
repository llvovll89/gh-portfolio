import { useEffect, useState } from "react";
import { loadAllPosts, loadSearchPosts, type BlogPost } from "../utils/loadAllPosts";

/** Full-text data is fetched only after the user starts a search. */
export function useBlogSearch(query: string) {
    const [searchPosts, setSearchPosts] = useState<BlogPost[] | null>(null);
    const [error, setError] = useState(false);
    const [attempt, setAttempt] = useState(0);
    const searching = Boolean(query.trim());
    useEffect(() => {
        if (!searching || searchPosts) return;
        let active = true;
        loadSearchPosts().then(posts => {
            if (active) { setSearchPosts(posts); setError(false); }
        }).catch(() => { if (active) setError(true); });
        return () => { active = false; };
    }, [searching, searchPosts, attempt]);
    return {
        posts: searching && searchPosts ? searchPosts : loadAllPosts(),
        loading: searching && !searchPosts && !error,
        error: searching && error,
        retry: () => { setError(false); setAttempt(value => value + 1); },
    };
}
