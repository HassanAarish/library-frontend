import GlassCard from "./GlassCard";

/**
 * KPI tile used across both dashboards.
 * trend: { value: "+12%", up: true } renders a coloured delta pill.
 */
const StatCard = ({ label, value, icon: Icon, trend, accent = "primary" }) => {
  const accents = {
    primary: "text-primary bg-primary/15",
    accent: "text-accent bg-accent/15",
    pink: "text-accent-2 bg-accent-2/15",
    success: "text-success bg-success/15",
    warning: "text-warning bg-warning/15",
  };

  return (
    <GlassCard hover className="p-5 animate-rise">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wider text-muted">{label}</p>
          <p className="mt-2 font-display text-3xl font-bold text-ink">{value}</p>
        </div>
        {Icon && (
          <span
            className={`grid size-11 shrink-0 place-items-center rounded-xl ${accents[accent]}`}
          >
            <Icon className="text-xl" />
          </span>
        )}
      </div>

      {trend && (
        <div className="mt-4 flex items-center gap-2">
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
              trend.up ? "bg-success/15 text-success" : "bg-danger/15 text-danger"
            }`}
          >
            {trend.value}
          </span>
          <span className="text-xs text-faint">vs last month</span>
        </div>
      )}
    </GlassCard>
  );
};

export default StatCard;
