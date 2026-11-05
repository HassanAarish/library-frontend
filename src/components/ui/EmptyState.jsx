import GlassCard from "./GlassCard";

/**
 * Friendly placeholder for not-yet-wired screens and empty lists.
 */
const EmptyState = ({ icon: Icon, title, description, action }) => {
  return (
    <GlassCard className="flex flex-col items-center justify-center px-6 py-16 text-center animate-rise">
      {Icon && (
        <span className="mb-5 grid size-16 place-items-center rounded-2xl bg-aurora-soft text-primary animate-float">
          <Icon className="text-3xl" />
        </span>
      )}
      <h3 className="font-display text-lg font-semibold text-ink">{title}</h3>
      {description && <p className="mt-2 max-w-sm text-sm text-muted">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </GlassCard>
  );
};

export default EmptyState;
