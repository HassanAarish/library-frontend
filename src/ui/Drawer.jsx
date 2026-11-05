import { useEffect, useRef } from "react";
import { LuX } from "react-icons/lu";
import { useI18n } from "@/i18n";
import { cn } from "./cn";

/**
 * Side panel for details (admin rows, etc.), on the native <dialog>: focus
 * handling, Escape and backdrop close like Modal. Full width on phones.
 */
const Drawer = ({ open, onClose, title, description, footer, children, width = "max-w-xl" }) => {
  const ref = useRef(null);
  const { t } = useI18n();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onCancel={(e) => {
        e.preventDefault();
        onClose?.();
      }}
      onClick={(e) => e.target === ref.current && onClose?.()}
      aria-labelledby={title ? "drawer-title" : undefined}
      className={cn(
        "ms-auto me-0 h-dvh max-h-dvh w-full border-s border-line bg-surface p-0 text-fg shadow-pop",
        "backdrop:bg-black/40 open:animate-fade-in",
        width,
      )}
    >
      {open ? (
        <div className="flex h-full flex-col">
          <div className="flex items-start justify-between gap-4 border-b border-line px-5 py-4 sm:px-6">
            <div className="min-w-0">
              {title ? (
                <h2 id="drawer-title" className="truncate text-xl font-semibold">
                  {title}
                </h2>
              ) : null}
              {description ? <p className="mt-1 text-sm text-fg-muted">{description}</p> : null}
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label={t("common.close")}
              className="-me-2 rounded-lg p-2 text-fg-subtle hover:bg-sunken hover:text-fg"
            >
              <LuX />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-5 sm:px-6">{children}</div>
          {footer ? (
            <div className="flex flex-wrap justify-end gap-2 border-t border-line bg-sunken/50 px-5 py-4 sm:px-6">
              {footer}
            </div>
          ) : null}
        </div>
      ) : null}
    </dialog>
  );
};

export default Drawer;

/** Pill switcher for a few views/filters: <Segmented value onChange options={[[value,label,count?]]} /> */
export const Segmented = ({ value, onChange, options, className, label }) => (
  <div
    role="group"
    aria-label={label}
    className={cn(
      "inline-flex flex-wrap gap-1 rounded-xl border border-line bg-surface p-1",
      className,
    )}
  >
    {options.map(([v, text, count]) => (
      <button
        key={v}
        type="button"
        aria-pressed={value === v}
        onClick={() => onChange(v)}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
          value === v ? "bg-fg text-canvas" : "text-fg-muted hover:bg-sunken hover:text-fg",
        )}
      >
        {text}
        {count ? (
          <span
            className={cn(
              "rounded-full px-1.5 text-[0.7rem]/4.5 font-semibold",
              value === v ? "bg-canvas/20" : "bg-danger text-white",
            )}
          >
            {count}
          </span>
        ) : null}
      </button>
    ))}
  </div>
);

/** Label/value rows for detail panels. */
export const DetailList = ({ items, className }) => (
  <dl className={cn("divide-y divide-line rounded-lg border border-line", className)}>
    {items
      .filter(([, v]) => v !== undefined && v !== null && v !== "")
      .map(([label, value]) => (
        <div key={label} className="grid grid-cols-[8rem_1fr] gap-3 px-4 py-2.5 text-sm">
          <dt className="text-fg-subtle">{label}</dt>
          <dd className="min-w-0 wrap-break-word text-fg">{value}</dd>
        </div>
      ))}
  </dl>
);
