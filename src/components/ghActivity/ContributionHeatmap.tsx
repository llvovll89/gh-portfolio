import { useState } from "react";

type Day = {
  date: string;
  contributionCount: number;
  color?: string;
};

type Week = {
  contributionDays: Day[];
};

const COLLAPSED_WEEKS = 10;
const SKELETON_DAYS = 7;

const HeatmapSkeleton = () => (
  <div className="flex gap-1 items-start">
    {Array.from({ length: COLLAPSED_WEEKS }).map((_, wi) => (
      <div key={wi} className="flex flex-col">
        {Array.from({ length: SKELETON_DAYS }).map((_, di) => (
          <div
            key={di}
            className="skeleton rounded-sm"
            style={{ width: 12, height: 12, margin: 2 }}
          />
        ))}
      </div>
    ))}
  </div>
);

const Cell = ({ day, small = false }: { day: Day; small?: boolean }) => {
  const count = day.contributionCount ?? 0;
  const title = `${day.date} — ${count} contribution${count !== 1 ? "s" : ""}`;
  const bg = day.color ? day.color : count > 0 ? "rgb(34,197,94)" : "rgba(255,255,255,0.05)";

  return (
    <div
      title={title}
      className="rounded-sm"
      style={
        small
          ? { width: 5, height: 5, margin: 1, backgroundColor: bg }
          : { width: 12, height: 12, margin: 2, backgroundColor: bg }
      }
    />
  );
};

const ContributionHeatmap = ({
  weeks,
  loading = false,
  hasError = false,
}: {
  weeks: Week[];
  loading?: boolean;
  hasError?: boolean;
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (loading) return <HeatmapSkeleton />;

  if (hasError) {
    return (
      <div className="flex gap-1 items-start opacity-30">
        {Array.from({ length: COLLAPSED_WEEKS }).map((_, wi) => (
          <div key={wi} className="flex flex-col">
            {Array.from({ length: SKELETON_DAYS }).map((_, di) => (
              <div
                key={di}
                className="rounded-sm"
                style={{ width: 12, height: 12, margin: 2, backgroundColor: "rgba(255,255,255,0.05)" }}
              />
            ))}
          </div>
        ))}
      </div>
    );
  }

  if (!weeks || weeks.length === 0) {
    return <div className="text-[12px] text-white/50">No contributions</div>;
  }

  const visibleWeeks = isExpanded ? weeks : weeks.slice(-COLLAPSED_WEEKS);
  const hasMore = weeks.length > COLLAPSED_WEEKS;

  return (
    <div className="w-full">
      <div
        className={
          isExpanded
            ? "flex flex-wrap gap-[2px] items-start"
            : "flex gap-1 items-start"
        }
      >
        {visibleWeeks.map((week, wi) => (
          <div key={wi} className="flex flex-col">
            {week.contributionDays.map((day, di) => (
              <Cell key={di} day={day} small={isExpanded} />
            ))}
          </div>
        ))}
      </div>
      {hasMore && (
        <button
          onClick={() => setIsExpanded((s) => !s)}
          className="mt-2 text-[10px] text-white/50 hover:text-white/80 transition-colors"
        >
          {isExpanded ? "접기" : "더보기"}
        </button>
      )}
    </div>
  );
};

export default ContributionHeatmap;
