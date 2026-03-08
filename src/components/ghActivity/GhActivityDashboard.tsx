import { useEffect, useState } from "react";
import ContributionHeatmap from "./ContributionHeatmap";
import RecentActivityList from "./RecentActivityList";

type Day = { date: string; contributionCount: number; color?: string };
type Week = { contributionDays: Day[] };

type ContributionsResponse = {
    data?: {
        user?: {
            contributionsCollection?: {
                contributionCalendar?: {
                    totalContributions: number;
                    weeks: Week[];
                };
            };
        };
    };
};

const GhActivityDashboard = ({ username }: { username?: string }) => {
    const user = username || (import.meta.env.VITE_GIT_HUB_APP_ADMIN as string);
    const [weeks, setWeeks] = useState<Week[]>([]);
    const [total, setTotal] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        let mounted = true;
        (async () => {
            setLoading(true);
            try {
                const to = new Date();
                const from = new Date();
                from.setFullYear(from.getFullYear() - 1);

                const qs = new URLSearchParams({
                    login: user,
                    from: from.toISOString(),
                    to: to.toISOString(),
                });
                const res = await fetch(`/api/contributions?${qs}`);
                if (!res.ok) throw new Error(`contributions fetch failed: ${res.status}`);

                const json: ContributionsResponse = await res.json();
                const calendar = json.data?.user?.contributionsCollection?.contributionCalendar;

                if (!mounted) return;
                setWeeks(calendar?.weeks ?? []);
                setTotal(calendar?.totalContributions ?? 0);
            } catch (error) {
                console.error("Error fetching contributions:", error);
            } finally {
                if (mounted) setLoading(false);
            }
        })();

        return () => {
            mounted = false;
        };
    }, [user]);

    return (
        <div className="w-full text-white">
            <div className="mb-2 flex items-center justify-between">
                <div className="text-sm font-semibold">{user} activity</div>
                <div className="text-[12px] text-white/60">
                    {loading
                        ? <span className="skeleton inline-block h-3 w-24 rounded align-middle" />
                        : `${total ?? 0} contributions`
                    }
                </div>
            </div>

            <div className="mb-3">
                <ContributionHeatmap weeks={weeks} loading={loading} />
            </div>

            <div>
                <div className="text-[12px] font-semibold mb-2">Recent activity</div>
                <RecentActivityList username={user} />
            </div>
        </div>
    );
};

export default GhActivityDashboard;
