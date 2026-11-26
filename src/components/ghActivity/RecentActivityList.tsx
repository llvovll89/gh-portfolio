import { uiText } from "../../utils/uiText";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { GITHUB_OWNER, githubFetch } from "../../http/api";

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
    const { t } = useTranslation();
    const [events, setEvents] = useState<GitHubEvent[] | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);

    // 요청이 겹칠 때 늦게 도착한 이전 응답이 최신 결과를 덮지 않도록 요청 순번으로 구분
    const requestIdRef = useRef(0);

    const fetchEvents = useCallback(async () => {
        const requestId = ++requestIdRef.current;
        setLoading(true);
        setError(false);
        try {
            const owner = username || GITHUB_OWNER;
            const data = await githubFetch(`/users/${owner}/events`, { per_page: "30" });
            if (requestId === requestIdRef.current) setEvents(data as GitHubEvent[]);
        } catch {
            if (requestId !== requestIdRef.current) return;
            setError(true);
            setEvents([]);
        } finally {
            if (requestId === requestIdRef.current) setLoading(false);
        }
    }, [username]);

    useEffect(() => {
        // username이 바뀔 때 외부 API와 동기화하는 데이터 fetch이며, 로딩 상태 전환은 fetch 함수 내부에서 처리되므로 effect가 적절함
        // eslint-disable-next-line react-hooks/set-state-in-effect
        void fetchEvents();
        // 언마운트·재요청 후 도착한 응답은 무시 (요청 순번 카운터라 cleanup 시점의 최신값을 올리는 것이 의도)
        const counter = requestIdRef;
        return () => { counter.current++; };
    }, [fetchEvents]);

    if (loading) return <ActivitySkeleton />;

    if (error) {
        return (
            <div className="flex items-center gap-2 text-[12px] text-muted">
                <span>{uiText("activity 데이터를 불러오지 못했습니다.")}</span>
                <button
                    onClick={() => { void fetchEvents(); }}
                    className="text-primary hover:text-primary/80 underline underline-offset-2 transition-colors"
                >
                    {uiText("재시도")}</button>
            </div>
        );
    }

    if (!events || events.length === 0) {
        return <div className="text-[12px] text-muted">No recent activity</div>;
    }

    const visibleEvents = isExpanded ? events : events.slice(0, COLLAPSED_COUNT);
    const hasMore = events.length > COLLAPSED_COUNT;

    return (
        <div className="flex flex-col gap-2">
            {visibleEvents.map((ev) => {
                const created = new Date(ev.created_at).toLocaleDateString();
                return (
                    <div key={ev.id} className="text-[12px] text-muted border-b border-sub-gary/20">
                        <div className="flex items-center justify-between gap-2 overflow-hidden">
                            <div className="truncate min-w-0">{ev.type} — {ev.repo?.name ?? ""}</div>
                            <div className="text-2xs text-muted flex-shrink-0">{created}</div>
                        </div>
                        {ev.payload?.commits && (
                            <div className="mt-1 text-2xs text-muted">
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
                    className="text-2xs text-muted hover:text-foreground transition-colors text-left"
                >
                    {isExpanded ? uiText("접기") : t("gitControl.showMoreActivity", { count: events.length - COLLAPSED_COUNT })}
                </button>
            )}
        </div>
    );
};

export default RecentActivityList;
