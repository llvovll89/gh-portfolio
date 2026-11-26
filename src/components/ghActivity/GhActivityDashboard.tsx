import { uiText } from "../../utils/uiText";
import { useCallback, useEffect, useRef, useState } from "react";
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

    // user 변경·재시도로 요청이 겹칠 때 늦게 도착한 이전 응답이 최신 결과를 덮지 않도록 요청 순번으로 구분
    const requestIdRef = useRef(0);

    const fetchContributions = useCallback(async () => {
        const requestId = ++requestIdRef.current;
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

            const json = (await res.json()) as ContributionsResponse;
            if (requestId !== requestIdRef.current) return;
            const calendar = json.data?.user?.contributionsCollection?.contributionCalendar;

            setWeeks(calendar?.weeks ?? []);
            setTotal(calendar?.totalContributions ?? 0);
        } catch {
            if (requestId === requestIdRef.current) setError("contributions");
        } finally {
            if (requestId === requestIdRef.current) setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        // user가 바뀔 때 외부 API와 동기화하는 데이터 fetch이며, 로딩 상태 전환은 fetch 함수 내부에서 처리되므로 effect가 적절함
        // eslint-disable-next-line react-hooks/set-state-in-effect
        void fetchContributions();
        // 언마운트·재요청 후 도착한 응답은 무시 (요청 순번 카운터라 cleanup 시점의 최신값을 올리는 것이 의도)
        const counter = requestIdRef;
        return () => { counter.current++; };
    }, [fetchContributions]);

    return (
        <div className="w-full text-foreground">
            <div className="mb-2 flex items-center justify-between">
                <div className="text-sm font-semibold">{user} activity</div>
                <div className="text-[12px] text-muted">
                    {loading
                        ? <span className="skeleton inline-block h-3 w-24 rounded align-middle" />
                        : error
                            ? <span className="text-rose-400/70">API error</span>
                            : `${total ?? 0} contributions`
                    }
                </div>
            </div>

            {error === "contributions" && !loading && (
                <div className="mb-3 flex items-center gap-2 text-[12px] text-muted">
                    <span>{uiText("contribution 데이터를 불러오지 못했습니다.")}</span>
                    <button
                        onClick={() => { void fetchContributions(); }}
                        className="text-primary hover:text-primary/80 underline underline-offset-2 transition-colors"
                    >
                        {uiText("재시도")}</button>
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
