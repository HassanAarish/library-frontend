import { useCallback, useEffect, useId, useRef, useState } from "react";
import { cn } from "./cn";

/**
 * Click-to-open panel anchored to a trigger (menus, notification tray).
 * Closes on outside click, Escape (focus returns to the trigger) and route
 * changes (call `close` from links).
 *
 *   <Popover trigger={(props) => <IconButton {...props} … />}>
 *     {({ close }) => <Menu …/>}
 *   </Popover>
 */
const Popover = ({ trigger, children, align = "end", className, width = "w-64" }) => {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const triggerRef = useRef(null);
  const id = useId();

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return undefined;
    const onPointer = (e) => {
      if (!rootRef.current?.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => {
      if (e.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      {trigger({
        ref: triggerRef,
        onClick: () => setOpen((v) => !v),
        "aria-expanded": open,
        "aria-controls": id,
        "aria-haspopup": "true",
      })}
      {open ? (
        <div
          id={id}
          className={cn(
            "absolute top-full z-50 mt-2 animate-pop-in rounded-card border border-line bg-surface shadow-pop",
            align === "end" ? "end-0" : "start-0",
            width,
            className,
          )}
        >
          {typeof children === "function" ? children({ close }) : children}
        </div>
      ) : null}
    </div>
  );
};

export default Popover;

/** Vertical list of menu actions inside a Popover. */
export const MenuItem = ({ as: Tag = "button", icon, children, className, danger, ...props }) => (
  <Tag
    {...(Tag === "button" ? { type: "button" } : {})}
    className={cn(
      "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-start text-sm transition-colors",
      danger ? "text-danger hover:bg-danger-soft" : "text-fg hover:bg-sunken",
      className,
    )}
    {...props}
  >
    {icon ? <span className="text-base text-fg-subtle">{icon}</span> : null}
    {children}
  </Tag>
);
