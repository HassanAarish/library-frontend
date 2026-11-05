import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { LuX } from "react-icons/lu";

/**
 * Centered overlay modal rendered via a portal to document.body. The portal is
 * essential: rendering a `fixed` overlay inside a transformed ancestor (e.g. a
 * card with `animate-rise`) would position it relative to that ancestor, not the
 * viewport. Backdrop click / ESC call onClose; body scroll is locked while open.
 */
const Modal = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = "md",
  closeOnClickOutside = true,
  showCloseButton = true,
}) => {
  // ===== Hooks run unconditionally (before the early return) =====
  const panelRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    if (!isOpen || !closeOnClickOutside) return;
    const handleClickOutside = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) onClose();
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose, closeOnClickOutside]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleEsc = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  // Lock body scroll (compensate for the scrollbar width to avoid layout shift)
  useEffect(() => {
    if (!isOpen) return;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = "hidden";
    document.body.style.paddingRight = `${scrollbarWidth}px`;
    return () => {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-2xl",
    full: "max-w-4xl",
  };

  const modal = (
    <div className="fixed inset-0 z-90 flex items-center justify-center p-4 sm:p-6">
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Panel */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        className={`animate-rise relative flex max-h-[90vh] w-full ${sizeClasses[size]} flex-col overflow-hidden rounded-2xl glass-strong`}
      >
        {(title || showCloseButton) && (
          <div className="flex items-start justify-between gap-4 px-6 pt-6">
            <div className="min-w-0">
              {title && <h3 className="font-display text-lg font-semibold text-ink">{title}</h3>}
              {description && <p className="mt-1 text-sm text-muted">{description}</p>}
            </div>
            {showCloseButton && (
              <button
                type="button"
                onClick={onClose}
                title="Close"
                className="grid size-8 shrink-0 place-items-center rounded-lg text-muted transition-colors hover:bg-white/5 hover:text-ink"
              >
                <LuX />
              </button>
            )}
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-6">{children}</div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
};

export default Modal;
