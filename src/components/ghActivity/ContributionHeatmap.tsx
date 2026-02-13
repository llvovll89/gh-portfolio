type Day = {
  date: string;
  contributionCount: number;
  color?: string;
};

type Week = {
  contributionDays: Day[];
};

const Cell = ({ day }: { day: Day }) => {
  const count = day.contributionCount ?? 0;
  const bg = day.color ? day.color : count > 0 ? "bg-green-500" : "bg-white/5";

  const title = `${day.date} — ${count} contribution${count !== 1 ? "s" : ""}`;

  return (
    <div
      title={title}
      className={`w-3 h-3 rounded-sm m-[2px] ${bg}`}
      style={{ width: 12, height: 12 }}
    />
  );
};

const ContributionHeatmap = ({ weeks }: { weeks: Week[] }) => {
  if (!weeks || weeks.length === 0) return <div className="text-[12px] text-white/50">No contributions</div>;

  return (
    <div className="w-full overflow-x-auto">
      <div className="flex gap-1 items-start">
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col">
            {week.contributionDays.map((day, di) => (
              <Cell key={di} day={day} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ContributionHeatmap;
