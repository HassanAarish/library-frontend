import { LuCircleAlert, LuInbox } from "react-icons/lu";
import { useI18n } from "@/i18n";
import Button from "./Button";
import { cn } from "./cn";

/** Loading placeholder block: <Skeleton className="h-4 w-32" /> */
export const Skeleton = ({ className, rounded = "rounded-md" }) => (
  <span aria-hidden className={cn("skeleton block", rounded, className)} />
);

/** "Nothing here yet" with an optional call to action. */
export const EmptyState = ({
  icon = <LuInbox />,
  title,
  description,
  action,
  className,
  as: Heading = "h2",
}) => (
  <div
    className={cn(
      "flex flex-col items-center justify-center rounded-card border border-dashed border-line-strong",
      "px-6 py-14 text-center",
      className,
    )}
  >
    <span className="mb-4 flex size-12 items-center justify-center rounded-full bg-sunken text-2xl text-fg-subtle">
      {icon}
    </span>
    <Heading className="text-lg font-semibold text-fg">{title}</Heading>
    {description ? <p className="mt-1 max-w-md text-sm text-fg-muted">{description}</p> : null}
    {action ? <div className="mt-5">{action}</div> : null}
  </div>
);

/** A failed request, with a retry and the backend request id for support. */
export const ErrorState = ({ error, onRetry, className }) => {
  const { t } = useI18n();
  return (
    <div
      role="alert"
      className={cn(
        "flex flex-col items-center rounded-card border border-danger/30 bg-danger-soft px-6 py-10 text-center",
        className,
      )}
    >
      <LuCircleAlert className="mb-3 text-3xl text-danger" />
      <p className="font-medium text-fg">{error?.message || t("errors.title")}</p>
      {error?.requestId ? (
        <p className="mt-1 text-xs text-fg-subtle">
          {t("errors.reference", { id: error.requestId })}
        </p>
      ) : null}
      {onRetry ? (
        <Button variant="secondary" size="sm" className="mt-4" onClick={onRetry}>
          {t("common.retry")}
        </Button>
      ) : null}
    </div>
  );
};

/** Inline notice banner: <Alert tone="warning" title="…">body</Alert> */
export const Alert = ({ tone = "info", title, children, action, className }) => {
  const tones = {
    info: "bg-info-soft border-info/25",
    success: "bg-success-soft border-success/25",
    warning: "bg-warning-soft border-warning/25",
    danger: "bg-danger-soft border-danger/25",
  };
  return (
    <div
      role={tone === "danger" ? "alert" : "status"}
      className={cn(
        "flex items-start gap-3 rounded-lg border px-4 py-3 text-sm",
        tones[tone],
        className,
      )}
    >
      <div className="flex-1">
        {title ? <p className="font-semibold text-fg">{title}</p> : null}
        {children ? <div className={cn("text-fg-muted", title && "mt-0.5")}>{children}</div> : null}
      </div>
      {action}
    </div>
  );
};
