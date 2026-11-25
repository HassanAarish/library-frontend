import { forwardRef, useId, useState } from "react";
import { LuEye, LuEyeOff } from "react-icons/lu";
import { useI18n } from "@/i18n";
import { Input } from "./Field";
import { cn } from "./cn";

/** Password input with a show/hide toggle. Use inside <Field>. */
export const PasswordInput = forwardRef(function PasswordInput(props, ref) {
  const [visible, setVisible] = useState(false);
  const { t } = useI18n();
  return (
    <Input
      ref={ref}
      type={visible ? "text" : "password"}
      {...props}
      endSlot={
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? t("auth.hidePassword") : t("auth.showPassword")}
          aria-pressed={visible}
          className="rounded-md p-2 text-fg-subtle hover:bg-sunken hover:text-fg"
        >
          {visible ? <LuEyeOff aria-hidden /> : <LuEye aria-hidden />}
        </button>
      }
    />
  );
});

/**
 * One-time code field (email OTP, authenticator): digits only, large and
 * spaced, and the phone's keyboard / SMS autofill suggest the code.
 */
export const CodeInput = forwardRef(function CodeInput({ onChange, className, ...props }, ref) {
  return (
    <Input
      ref={ref}
      inputMode="numeric"
      autoComplete="one-time-code"
      maxLength={6}
      size="lg"
      className={cn("text-center font-mono text-2xl tracking-[0.5em]", className)}
      onChange={(e) => {
        e.target.value = e.target.value.replace(/\D/g, "").slice(0, 6);
        onChange?.(e);
      }}
      {...props}
    />
  );
});

/** On/off switch with a label and optional hint (a real checkbox underneath). */
export const Switch = ({ label, hint, checked, onChange, disabled, className }) => {
  const id = useId();
  return (
    <label
      htmlFor={id}
      className={cn(
        "flex cursor-pointer items-center justify-between gap-4 rounded-lg border border-line bg-surface px-4 py-3",
        disabled && "cursor-not-allowed opacity-60",
        className,
      )}
    >
      <span className="min-w-0">
        <span className="block text-sm font-medium text-fg">{label}</span>
        {hint ? <span className="block text-xs text-fg-subtle">{hint}</span> : null}
      </span>
      <span className="relative inline-flex shrink-0">
        <input
          id={id}
          type="checkbox"
          role="switch"
          className="peer sr-only"
          checked={checked}
          onChange={(e) => onChange?.(e.target.checked)}
          disabled={disabled}
        />
        <span className="h-6 w-11 rounded-full bg-line-strong transition-colors peer-checked:bg-brand peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ring" />
        <span className="absolute inset-s-0.5 top-0.5 size-5 rounded-full bg-white shadow-sm transition-transform peer-checked:translate-x-5 rtl:peer-checked:-translate-x-5" />
      </span>
    </label>
  );
};

/** Horizontal rule with a centred label: "or continue with". */
export const Divider = ({ label, className }) => (
  <div className={cn("flex items-center gap-3", className)}>
    <span className="h-px flex-1 bg-line" />
    {label ? (
      <span className="text-xs font-medium tracking-wide text-fg-subtle uppercase">{label}</span>
    ) : null}
    <span className="h-px flex-1 bg-line" />
  </div>
);
