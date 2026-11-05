import { LuChevronLeft, LuChevronRight } from "react-icons/lu";
import { useI18n } from "@/i18n";
import Button from "./Button";
import { cn } from "./cn";

/** Page-width wrapper with the standard gutters. */
export const Container = ({ size = "lg", className, children }) => {
  const widths = { sm: "max-w-2xl", md: "max-w-4xl", lg: "max-w-6xl", xl: "max-w-7xl" };
  return (
    <div className={cn("mx-auto w-full px-4 sm:px-6 lg:px-8", widths[size], className)}>
      {children}
    </div>
  );
};

/** Page title row: eyebrow, serif title, description and actions. */
export const PageHeader = ({ eyebrow, title, description, actions, className }) => (
  <header className={cn("mb-8 flex flex-wrap items-end justify-between gap-4", className)}>
    <div className="min-w-0">
      {eyebrow ? (
        <p className="mb-1 text-xs font-semibold tracking-[0.14em] text-gold uppercase">
          {eyebrow}
        </p>
      ) : null}
      <h1 className="text-3xl font-semibold text-fg sm:text-4xl">{title}</h1>
      {description ? <p className="mt-2 max-w-2xl text-fg-muted">{description}</p> : null}
    </div>
    {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
  </header>
);

/**
 * Previous / next with "Page x of y", for the backend's paginated responses
 * ({ page, totalPages, hasPrevPage, hasNextPage }).
 */
export const Pagination = ({ page, totalPages, onChange, className }) => {
  const { t } = useI18n();
  if (!totalPages || totalPages <= 1) return null;
  return (
    <nav
      aria-label="Pagination"
      className={cn("mt-8 flex items-center justify-center gap-3", className)}
    >
      <Button
        variant="secondary"
        size="sm"
        icon={<LuChevronLeft className="rtl:rotate-180" />}
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
      >
        {t("common.previous")}
      </Button>
      <span className="text-sm text-fg-muted">
        {t("common.pageOf", { page, total: totalPages })}
      </span>
      <Button
        variant="secondary"
        size="sm"
        iconEnd={<LuChevronRight className="rtl:rotate-180" />}
        disabled={page >= totalPages}
        onClick={() => onChange(page + 1)}
      >
        {t("common.next")}
      </Button>
    </nav>
  );
};
