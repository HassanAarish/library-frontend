import { Link } from "react-router-dom";
import { useI18n } from "@/i18n";
import { cn } from "@/ui";

/**
 * Wordmark: a bookmark-ribbon glyph + "LibraryHub" in the editorial serif.
 * `inverted` is for coloured backgrounds (e.g. the sign-in brand panel).
 */
const Logo = ({ to = "/", className, compact, inverted }) => {
  const { t } = useI18n();
  return (
    <Link to={to} className={cn("group inline-flex items-center gap-2.5", className)}>
      <span
        className={cn(
          "flex size-9 items-center justify-center rounded-lg shadow-sm",
          inverted ? "bg-white/15 text-current ring-1 ring-white/25" : "bg-brand text-on-brand",
        )}
      >
        <svg viewBox="0 0 24 24" className="size-5" fill="none" aria-hidden>
          <path
            d="M5 4.5A1.5 1.5 0 0 1 6.5 3H17a2 2 0 0 1 2 2v14.5a.5.5 0 0 1-.8.4L12 15.5l-6.2 4.4a.5.5 0 0 1-.8-.4V4.5Z"
            fill="currentColor"
            opacity="0.92"
          />
          <path
            d="M9 7.5h6M9 10.5h4"
            stroke={inverted ? "rgb(0 0 0 / 0.35)" : "var(--brand)"}
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
      </span>
      {compact ? (
        <span className="sr-only">{t("app.name")}</span>
      ) : (
        <span
          className={cn(
            "font-serif text-xl font-semibold tracking-tight",
            inverted ? "text-current" : "text-fg",
          )}
        >
          Library<span className={inverted ? "opacity-75" : "text-brand"}>Hub</span>
        </span>
      )}
    </Link>
  );
};

export default Logo;
