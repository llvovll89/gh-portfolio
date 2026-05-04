import { useCallback, useEffect, useState } from "react";
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
    const [error, setError] = useState<string | null>(null);

    const fetchContributions = useCallback(async () => {
        setLoading(true);
        setError(null);
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
            if (!res.ok) throw new Error(`${res.status}`);

            const json: ContributionsResponse = await res.json();
            const calendar = json.data?.user?.contributionsCollection?.contributionCalendar;

            setWeeks(calendar?.weeks ?? []);
            setTotal(calendar?.totalContributions ?? 0);
        } catch {
            setError("contributions");
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchContributions();
    }, [fetchContributions]);

    return (
        <div className="w-full text-white">
            <div className="mb-2 flex items-center justify-between">
                <div className="text-sm font-semibold">{user} activity</div>
                <div className="text-[12px] text-white/60">
                    {loading
                        ? <span className="skeleton inline-block h-3 w-24 rounded align-middle" />
                        : error
                            ? <span className="text-rose-400/70">API error</span>
                            : `${total ?? 0} contributions`
                    }
                </div>
            </div>

            {error === "contributions" && !loading && (
                <div className="mb-3 flex items-center gap-2 text-[12px] text-white/40">
                    <span>contribution 데이터를 불러오지 못했습니다.</span>
                    <button
                        onClick={fetchContributions}
                        className="text-primary hover:text-primary/80 underline underline-offset-2 transition-colors"
                    >
                        재시도
                    </button>
                </div>
            )}

            <div className="mb-3">
                <ContributionHeatmap weeks={weeks} loading={loading} hasError={!!error} />
            </div>

            <div>
                <div className="text-[12px] font-semibold mb-2">Recent activity</div>
                <RecentActivityList username={user} />
            </div>
        </div>
    );
};

export default GhActivityDashboard;
