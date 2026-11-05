import { useState } from "react";
import { cn } from "./cn";

const SIZES = {
  xs: "w-12",
  sm: "w-20",
  md: "w-32",
  lg: "w-44",
  xl: "w-56",
  fill: "w-full",
};

// Deterministic, muted cloth colours for books without a cover image.
const CLOTH = ["#1f5c4a", "#7a3b2e", "#2b4a6f", "#6b5a2e", "#4a3b5c", "#2e5c5a"];
const pick = (text = "") =>
  CLOTH[[...text].reduce((sum, c) => sum + c.charCodeAt(0), 0) % CLOTH.length];

/**
 * A book cover at 2:3, with a spine shadow. The typeset cloth-bound cover
 * (title + author) is always underneath: it shows while the image loads,
 * when there is no image, and if the image fails, so a card is never blank.
 * `plain` keeps the cloth colour but hides the text (decorative stacks).
 */
const BookCover = ({
  src,
  title = "",
  author,
  size = "md",
  className,
  loading = "lazy",
  plain = false,
}) => {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const hasImage = src && !failed;

  return (
    <div
      role="img"
      aria-label={title ? `Cover of ${title}` : undefined}
      className={cn(
        "@container relative aspect-2/3 shrink-0 overflow-hidden rounded-[3px_6px_6px_3px] shadow-book",
        SIZES[size],
        className,
      )}
      style={{ backgroundColor: pick(title) }}
    >
      <div
        aria-hidden
        className={cn(
          "flex size-full flex-col justify-between p-[10%] text-white transition-opacity duration-300",
          hasImage && loaded && "opacity-0",
        )}
      >
        <span className="h-px w-1/3 bg-white/50" />
        <div className={plain ? "invisible" : undefined}>
          <p className="line-clamp-4 font-serif text-[clamp(0.6rem,7cqw,1.1rem)] leading-tight font-semibold">
            {title}
          </p>
          {author ? (
            <p className="mt-1 line-clamp-2 text-[clamp(0.5rem,4.5cqw,0.75rem)] text-white/75">
              {author}
            </p>
          ) : null}
        </div>
        <span className="h-px w-1/3 bg-white/50" />
      </div>

      {hasImage ? (
        <img
          src={src}
          alt=""
          loading={loading}
          decoding="async"
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
          className={cn(
            "absolute inset-0 size-full object-cover transition-opacity duration-300",
            loaded ? "opacity-100" : "opacity-0",
          )}
        />
      ) : null}

      {/* spine shading */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-y-0 inset-s-0 w-[6%] bg-linear-to-r from-black/25 to-transparent rtl:bg-linear-to-l"
      />
    </div>
  );
};

export default BookCover;
