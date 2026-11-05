import { useEffect, useRef } from "react";
import { LuX } from "react-icons/lu";
import { useI18n } from "@/i18n";
import { cn } from "./cn";

const WIDTHS = { sm: "max-w-sm", md: "max-w-lg", lg: "max-w-2xl", xl: "max-w-4xl" };

/**
 * Accessible dialog built on the native <dialog> element: focus is moved in
 * and restored, Escape and the backdrop close it, the page behind is inert.
 *
 *   <Modal open={open} onClose={() => setOpen(false)} title="Cancel booking?"
 *     footer={<Button onClick={confirm}>Yes, cancel</Button>}>…</Modal>
 */
const Modal = ({
  open,
  onClose,
  title,
  description,
  footer,
  size = "md",
  children,
  dismissable = true,
}) => {
  const ref = useRef(null);
  const { t } = useI18n();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  const onCancel = (e) => {
    e.preventDefault(); // Escape: let React state decide
    if (dismissable) onClose?.();
  };

  const onBackdrop = (e) => {
    if (dismissable && e.target === ref.current) onClose?.();
  };

  return (
    <dialog
      ref={ref}
      onCancel={onCancel}
      onClick={onBackdrop}
      aria-labelledby={title ? "modal-title" : undefined}
      className={cn(
        "m-auto w-[calc(100%-2rem)] rounded-card border border-line bg-surface p-0 text-fg shadow-pop",
        "backdrop:bg-black/40 backdrop:backdrop-blur-[2px] open:animate-pop-in",
        WIDTHS[size],
      )}
    >
      {open ? (
        <div className="flex max-h-[85vh] flex-col">
          {title || dismissable ? (
            <div className="flex items-start justify-between gap-4 border-b border-line px-6 py-4">
              <div>
                {title ? (
                  <h2 id="modal-title" className="text-xl font-semibold">
                    {title}
                  </h2>
                ) : null}
                {description ? <p className="mt-1 text-sm text-fg-muted">{description}</p> : null}
              </div>
              {dismissable ? (
                <button
                  type="button"
                  onClick={onClose}
                  aria-label={t("common.close")}
                  className="-me-2 rounded-lg p-2 text-fg-subtle hover:bg-sunken hover:text-fg"
                >
                  <LuX />
                </button>
              ) : null}
            </div>
          ) : null}
          <div className="overflow-y-auto px-6 py-5">{children}</div>
          {footer ? (
            <div className="flex flex-wrap justify-end gap-2 border-t border-line bg-sunken/50 px-6 py-4">
              {footer}
            </div>
          ) : null}
        </div>
      ) : null}
    </dialog>
  );
};

export default Modal;
