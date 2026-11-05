/**
 * Status pill. Maps the backend moderation states (pending/approved/rejected)
 * plus generic tones used across tables.
 */
const TONES = {
  pending: "bg-warning/15 text-warning border-warning/20",
  approved: "bg-success/15 text-success border-success/20",
  active: "bg-success/15 text-success border-success/20",
  rejected: "bg-danger/15 text-danger border-danger/20",
  expired: "bg-danger/15 text-danger border-danger/20",
  blocked: "bg-danger/15 text-danger border-danger/20",
  admin: "bg-primary/15 text-primary border-primary/25",
  user: "bg-white/8 text-muted border-white/10",
  accent: "bg-accent/15 text-accent border-accent/20",
  neutral: "bg-white/8 text-muted border-white/10",
};

const Badge = ({ children, tone = "neutral", className = "", dot = false }) => {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium capitalize ${
        TONES[tone] || TONES.neutral
      } ${className}`}
    >
      {dot && <span className="size-1.5 rounded-full bg-current" />}
      {children}
    </span>
  );
};

export default Badge;
