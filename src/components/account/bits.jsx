import { useState } from "react";
import { LuCheck, LuCopy } from "react-icons/lu";
import { useI18n } from "@/i18n";
import { cn } from "@/ui";

/**
 * A value the user needs to type elsewhere (account number, reference), with a copy button.
 * `wrap` lets a long value (a setup key) break across lines instead of being cut off;
 * `copyValue` is copied instead of the shown value (e.g. a key shown with spaces).
 */
export const CopyValue = ({ label, value, copyValue, mono, wrap, className }) => {
  const { t } = useI18n();
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(String(copyValue ?? value));
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard blocked: the value is still visible to copy by hand
    }
  };

  return (
    <div
      className={cn(
        "flex items-center justify-between gap-3 rounded-lg bg-sunken px-4 py-3",
        className,
      )}
    >
      <div className="min-w-0">
        <p className="text-xs text-fg-subtle">{label}</p>
        <p
          className={cn(
            "text-base font-semibold text-fg",
            wrap ? "break-all" : "truncate",
            mono && "font-mono tracking-wide",
          )}
        >
          {value}
        </p>
      </div>
      <button
        type="button"
        onClick={copy}
        aria-label={`${t("payment.copy")} ${label}`}
        className="inline-flex shrink-0 items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm font-medium text-brand hover:bg-brand-soft"
      >
        {copied ? <LuCheck aria-hidden /> : <LuCopy aria-hidden />}
        <span aria-live="polite">{copied ? t("payment.copied") : t("payment.copy")}</span>
      </button>
    </div>
  );
};
