import { useCallback, useEffect, useState } from "react";
import { GITHUB_OWNER } from "../../http/api";

type GitHubEvent = {
    id: string;
    type: string;
    repo: { name: string };
    created_at: string;
    payload?: {
        commits?: { message: string }[];
    };
};

const COLLAPSED_COUNT = 5;

const ActivitySkeleton = () => (
    <div className="flex flex-col gap-2">
        {Array.from({ length: COLLAPSED_COUNT }).map((_, i) => (
            <div key={i} className="border-b border-sub-gary/20 pb-2">
                <div className="flex items-center justify-between gap-2">
                    <div className="skeleton h-3 rounded w-3/4" />
                    <div className="skeleton h-3 rounded w-12 flex-shrink-0" />
                </div>
            </div>
        ))}
    </div>
);

const RecentActivityList = ({ username }: { username: string }) => {
    const [events, setEvents] = useState<GitHubEvent[] | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);

    const fetchEvents = useCallback(async () => {
        setLoading(true);
        setError(false);
        try {
            const owner = username || GITHUB_OWNER;
            const qs = new URLSearchParams({
                path: `/users/${owner}/events`,
                per_page: "30",
            });
            const res = await fetch(`/api/github?${qs}`);
            if (!res.ok) throw new Error(`events fetch failed: ${res.status}`);
            setEvents(await res.json());
        } catch {
            setError(true);
            setEvents([]);
        } finally {
            setLoading(false);
        }
    }, [username]);

    useEffect(() => {
        fetchEvents();
    }, [fetchEvents]);

    if (loading) return <ActivitySkeleton />;

    if (error) {
        return (
            <div className="flex items-center gap-2 text-[12px] text-white/40">
                <span>activity 데이터를 불러오지 못했습니다.</span>
                <button
                    onClick={fetchEvents}
                    className="text-primary hover:text-primary/80 underline underline-offset-2 transition-colors"
                >
                    재시도
                </button>
            </div>
        );
    }

    if (!events || events.length === 0) {
        return <div className="text-[12px] text-white/50">No recent activity</div>;
    }

    const visibleEvents = isExpanded ? events : events.slice(0, COLLAPSED_COUNT);
    const hasMore = events.length > COLLAPSED_COUNT;

    return (
        <div className="flex flex-col gap-2">
            {visibleEvents.map((ev) => {
                const created = new Date(ev.created_at).toLocaleDateString();
                return (
                    <div key={ev.id} className="text-[12px] text-white/70 border-b border-sub-gary/20">
                        <div className="flex items-center justify-between gap-2 overflow-hidden">
                            <div className="truncate min-w-0">{ev.type} — {ev.repo?.name ?? ""}</div>
                            <div className="text-[11px] text-white/40 flex-shrink-0">{created}</div>
                        </div>
                        {ev.payload?.commits && (
                            <div className="mt-1 text-[11px] text-white/50">
                                {ev.payload.commits.slice(0, 2).map((c, i) => (
                                    <div key={i} className="truncate">{c.message}</div>
                                ))}
                            </div>
                        )}
                    </div>
                );
            })}
            {hasMore && (
                <button
                    onClick={() => setIsExpanded((s) => !s)}
                    className="text-[10px] text-white/50 hover:text-white/80 transition-colors text-left"
                >
                    {isExpanded ? "접기" : `더보기 (${events.length - COLLAPSED_COUNT}개)`}
                </button>
            )}
        </div>
    );
};

export default RecentActivityList;
