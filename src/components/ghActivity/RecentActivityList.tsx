import { useEffect, useState } from "react";
import { octokit } from "../../http/api";

type EventItem = any;

const COLLAPSED_COUNT = 5;

const RecentActivityList = ({ username }: { username: string }) => {
  const [events, setEvents] = useState<EventItem[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const res = await octokit.request("GET /users/{username}/events", { username, per_page: 30 });
        if (!mounted) return;
        setEvents(res.data as EventItem[]);
      } catch (error) {
        console.error("Error fetching user events:", error);
        if (mounted) setEvents([]);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [username]);

  if (loading) return <div className="text-[12px] text-white/50">Loading events...</div>;
  if (!events || events.length === 0) return <div className="text-[12px] text-white/50">No recent activity</div>;

  const visibleEvents = isExpanded ? events : events.slice(0, COLLAPSED_COUNT);
  const hasMore = events.length > COLLAPSED_COUNT;

  return (
    <div className="flex flex-col gap-2">
      {visibleEvents.map((ev, idx) => {
        const type = ev.type;
        const repo = ev.repo?.name ?? "";
        const created = new Date(ev.created_at).toLocaleDateString();

        return (
          <div key={idx} className="text-[12px] text-white/70 border-b border-sub-gary/20">
            <div className="flex items-center justify-between gap-2 overflow-hidden">
              <div className="truncate min-w-0">{type} — {repo}</div>
              <div className="text-[11px] text-white/40 flex-shrink-0">{created}</div>
            </div>
            {ev.payload?.commits && (
              <div className="mt-1 text-[11px] text-white/50">
                {ev.payload.commits.slice(0, 2).map((c: any, i: number) => (
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
