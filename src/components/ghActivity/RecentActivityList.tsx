import { useEffect, useState } from "react";
import { octokit } from "../../http/api";

type EventItem = any;

const RecentActivityList = ({ username }: { username: string }) => {
  const [events, setEvents] = useState<EventItem[] | null>(null);
  const [loading, setLoading] = useState(false);

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

  return (
    <div className="flex flex-col gap-2">
      {events.map((ev, idx) => {
        const type = ev.type;
        const repo = ev.repo?.name ?? "";
        const created = new Date(ev.created_at).toLocaleString();

        return (
          <div key={idx} className="text-[12px] text-white/70 border-b border-sub-gary/20">
            <div className="flex items-center justify-between">
              <div className="truncate">{type} — {repo}</div>
              <div className="text-[11px] text-white/40">{created}</div>
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
    </div>
  );
};

export default RecentActivityList;
