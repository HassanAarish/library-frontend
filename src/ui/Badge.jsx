import { cn } from "./cn";

const TONES = {
  neutral: "bg-sunken text-fg-muted border-line",
  brand: "bg-brand-soft text-brand border-transparent",
  gold: "bg-gold-soft text-gold border-transparent",
  success: "bg-success-soft text-success border-transparent",
  warning: "bg-warning-soft text-warning border-transparent",
  danger: "bg-danger-soft text-danger border-transparent",
  info: "bg-info-soft text-info border-transparent",
};

/** Small status label: <Badge tone="success" dot>Active</Badge> */
const Badge = ({ tone = "neutral", dot, className, children }) => (
  <span
    className={cn(
      "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap",
      TONES[tone],
      className,
    )}
  >
    {dot ? <span className="size-1.5 rounded-full bg-current" aria-hidden /> : null}
    {children}
  </span>
);

export default Badge;
