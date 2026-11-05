import { forwardRef } from "react";
import { Link } from "react-router-dom";
import { cn } from "./cn";
import Spinner from "./Spinner";

const VARIANTS = {
  primary: "bg-brand text-on-brand hover:bg-brand-hover shadow-sm",
  secondary: "bg-surface text-fg border border-line-strong hover:bg-sunken shadow-sm",
  ghost: "text-fg hover:bg-sunken",
  subtle: "bg-brand-soft text-brand hover:bg-brand-soft/70",
  danger: "bg-danger text-white hover:bg-danger/90 shadow-sm",
  link: "text-brand underline-offset-4 hover:underline px-0! h-auto!",
};

const SIZES = {
  sm: "h-8 px-3 text-sm gap-1.5 rounded-lg",
  md: "h-10 px-4 text-sm gap-2 rounded-lg",
  lg: "h-12 px-6 text-base gap-2.5 rounded-xl",
};

/**
 * <Button variant="primary|secondary|ghost|subtle|danger|link" size="sm|md|lg"
 *   loading icon={<LuPlus />} to="/path" (renders a Link) fullWidth>
 */
const Button = forwardRef(function Button(
  {
    variant = "primary",
    size = "md",
    loading = false,
    disabled,
    icon,
    iconEnd,
    fullWidth,
    to,
    href,
    className,
    children,
    type = "button",
    ...props
  },
  ref,
) {
  const classes = cn(
    "inline-flex items-center justify-center font-medium whitespace-nowrap select-none",
    "transition-colors duration-150 disabled:opacity-55 disabled:pointer-events-none",
    VARIANTS[variant],
    SIZES[size],
    fullWidth && "w-full",
    className,
  );

  const content = (
    <>
      {loading ? <Spinner size="sm" /> : icon}
      {children}
      {iconEnd}
    </>
  );

  if (to) {
    return (
      <Link ref={ref} to={to} className={classes} {...props}>
        {content}
      </Link>
    );
  }
  if (href) {
    return (
      <a ref={ref} href={href} className={classes} {...props}>
        {content}
      </a>
    );
  }

  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={classes}
      {...props}
    >
      {content}
    </button>
  );
});

export default Button;

/** Square icon-only button; `label` is required for screen readers. */
export const IconButton = forwardRef(function IconButton(
  { label, icon, variant = "ghost", size = "md", className, badge, ...props },
  ref,
) {
  const box = { sm: "size-8", md: "size-10", lg: "size-12" }[size];
  return (
    <button
      ref={ref}
      type="button"
      aria-label={label}
      title={label}
      className={cn(
        "relative inline-flex items-center justify-center rounded-lg text-fg-muted",
        "transition-colors hover:text-fg disabled:opacity-55",
        VARIANTS[variant],
        box,
        "px-0",
        className,
      )}
      {...props}
    >
      <span className="text-[1.15rem]">{icon}</span>
      {badge ? (
        <span className="absolute -end-0.5 -top-0.5 flex min-w-4.5 items-center justify-center rounded-full bg-danger px-1 text-[0.65rem] leading-4.5 font-semibold text-white">
          {badge}
        </span>
      ) : null}
    </button>
  );
});
