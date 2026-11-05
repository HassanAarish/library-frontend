import { useState } from "react";
import { cn } from "./cn";

const SIZES = {
  sm: "size-8 text-xs",
  md: "size-10 text-sm",
  lg: "size-16 text-xl",
  xl: "size-24 text-3xl",
};

const initials = (name = "") =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "?";

/** Profile photo with an initials fallback (also used when the image fails). */
const Avatar = ({ src, name, size = "md", className }) => {
  const [failed, setFailed] = useState(false);
  const showImage = src && !failed;

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full",
        "bg-brand-soft font-semibold text-brand ring-1 ring-line",
        SIZES[size],
        className,
      )}
    >
      {showImage ? (
        <img
          src={src}
          alt={name ? `${name}` : ""}
          className="size-full object-cover"
          onError={() => setFailed(true)}
        />
      ) : (
        <span aria-hidden>{initials(name)}</span>
      )}
    </span>
  );
};

export default Avatar;
