import { cn } from "./cn";

/** Surface with the design system's border, radius and soft shadow. */
const Card = ({ as: Tag = "div", padded = true, interactive, className, children, ...props }) => (
  <Tag
    className={cn(
      "rounded-card border border-line bg-surface shadow-card",
      padded && "p-5 sm:p-6",
      interactive && "transition-shadow hover:shadow-pop",
      className,
    )}
    {...props}
  >
    {children}
  </Tag>
);

/** Card title row. `as` sets the heading level (h2 under the page h1, h3 inside a section). */
export const CardHeader = ({ title, description, action, className, as: Heading = "h2" }) => (
  <div className={cn("mb-4 flex items-start justify-between gap-4", className)}>
    <div>
      <Heading className="text-lg font-semibold text-fg">{title}</Heading>
      {description ? <p className="mt-1 text-sm text-fg-muted">{description}</p> : null}
    </div>
    {action}
  </div>
);

export default Card;
