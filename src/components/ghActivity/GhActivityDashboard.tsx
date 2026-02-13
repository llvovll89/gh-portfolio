import { useEffect, useState } from "react";
import { octokit } from "../../http/api";
import ContributionHeatmap from "./ContributionHeatmap";
import RecentActivityList from "./RecentActivityList";
import { CONTRIBUTIONS_QUERY } from "../../utils/ghQueries";

type Day = { date: string; contributionCount: number; color?: string };
type Week = { contributionDays: Day[] };

const GhActivityDashboard = ({ username }: { username?: string }) => {
  const user = username || (import.meta.env.VITE_GITHUB_USERNAME as string) || "llvovll89";
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

        const res: any = await (octokit as any).graphql(CONTRIBUTIONS_QUERY, {
          login: user,
          from: from.toISOString(),
          to: to.toISOString(),
        });

        const weeksData: Week[] = res?.user?.contributionsCollection?.contributionCalendar?.weeks ?? [];
        const totalContrib: number = res?.user?.contributionsCollection?.contributionCalendar?.totalContributions ?? 0;

        if (!mounted) return;
        setWeeks(weeksData);
        setTotal(totalContrib);
      } catch (error) {
        console.error("Error fetching contributions:", error);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [username]);

  return (
    <div className="w-full text-white">
      <div className="mb-2 flex items-center justify-between">
        <div className="text-sm font-semibold">{user} activity</div>
        <div className="text-[12px] text-white/60">{loading ? "Loading..." : `${total ?? 0} contributions`}</div>
      </div>

      <div className="mb-3">
        <ContributionHeatmap weeks={weeks} />
      </div>

      <div>
        <div className="text-[12px] font-semibold mb-2">Recent activity</div>
        <RecentActivityList username={user} />
      </div>
    </div>
  );
};

export default GhActivityDashboard;
