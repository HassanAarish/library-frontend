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
 * A book cover at 2:3, with a spine shadow. Without an image (or if it fails)
 * it renders a typeset cloth-bound cover from the title and author.
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
  const [failed, setFailed] = useState(false);
  const showImage = src && !failed;

  return (
    <div
      className={cn(
        "@container relative aspect-2/3 shrink-0 overflow-hidden rounded-[3px_6px_6px_3px] bg-sunken shadow-book",
        SIZES[size],
        className,
      )}
    >
      {showImage ? (
        <img
          src={src}
          alt={title ? `Cover of ${title}` : ""}
          loading={loading}
          decoding="async"
          onError={() => setFailed(true)}
          className="size-full object-cover"
        />
      ) : (
        <div
          className="flex size-full flex-col justify-between p-[10%] text-white"
          style={{ backgroundColor: pick(title) }}
          role="img"
          aria-label={title ? `Cover of ${title}` : undefined}
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
      )}
      {/* spine shading */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-y-0 inset-s-0 w-[6%] bg-linear-to-r from-black/25 to-transparent rtl:bg-linear-to-l"
      />
    </div>
  );
};

export default BookCover;
