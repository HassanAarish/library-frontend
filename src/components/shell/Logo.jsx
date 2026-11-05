import { Link } from "react-router-dom";
import { useI18n } from "@/i18n";
import { cn } from "@/ui";

/** Wordmark: a bookmark-ribbon glyph + "LibraryHub" in the editorial serif. */
const Logo = ({ to = "/", className, compact }) => {
  const { t } = useI18n();
  return (
    <Link to={to} className={cn("group inline-flex items-center gap-2.5", className)}>
      <span className="flex size-9 items-center justify-center rounded-lg bg-brand text-on-brand shadow-sm">
        <svg viewBox="0 0 24 24" className="size-5" fill="none" aria-hidden>
          <path
            d="M5 4.5A1.5 1.5 0 0 1 6.5 3H17a2 2 0 0 1 2 2v14.5a.5.5 0 0 1-.8.4L12 15.5l-6.2 4.4a.5.5 0 0 1-.8-.4V4.5Z"
            fill="currentColor"
            opacity="0.92"
          />
          <path
            d="M9 7.5h6M9 10.5h4"
            stroke="var(--brand)"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
      </span>
      {compact ? (
        <span className="sr-only">{t("app.name")}</span>
      ) : (
        <span className="font-serif text-xl font-semibold tracking-tight text-fg">
          Library<span className="text-brand">Hub</span>
        </span>
      )}
    </Link>
  );
};

export default Logo;
