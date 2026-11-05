import { cn } from "./cn";

const SIZES = { sm: "size-4 border-2", md: "size-6 border-2", lg: "size-10 border-[3px]" };

const Spinner = ({ size = "md", className, label }) => (
  <span
    role={label ? "status" : undefined}
    aria-label={label}
    className={cn(
      "inline-block shrink-0 animate-spin rounded-full border-current border-e-transparent",
      SIZES[size],
      className,
    )}
  />
);

export default Spinner;
