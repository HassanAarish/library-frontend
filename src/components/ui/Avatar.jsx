const SIZES = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-12 w-12 text-base",
};

/**
 * Initials avatar with a gradient ring. Falls back to the first letter of
 * the user's name when no profile picture is available.
 */
const Avatar = ({ name = "", src, size = "md", className = "" }) => {
  const initials = name
    .trim()
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <span
      className={`relative inline-grid shrink-0 place-items-center rounded-full bg-aurora font-display font-semibold text-white ${SIZES[size]} ${className}`}
    >
      {src ? (
        <img src={src} alt={name} className="size-full rounded-full object-cover" />
      ) : (
        initials || "?"
      )}
    </span>
  );
};

export default Avatar;
