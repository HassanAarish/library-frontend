import { cloneElement, forwardRef, isValidElement, useId } from "react";
import { cn } from "./cn";

const controlBase = cn(
  "w-full rounded-lg border bg-surface text-fg placeholder:text-fg-subtle",
  "transition-colors outline-none",
  "focus:border-brand focus:ring-2 focus:ring-brand/20",
  "disabled:bg-sunken disabled:text-fg-subtle",
);

const stateClass = (invalid) =>
  invalid ? "border-danger focus:border-danger focus:ring-danger/20" : "border-line-strong";

/**
 * Label + control + hint/error, wired for accessibility:
 *   <Field label="Email" error={errors.email} hint="We'll never share it">
 *     <Input type="email" {...register} />
 *   </Field>
 */
export const Field = ({ label, hint, error, required, className, children, labelAction }) => {
  const id = useId();
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;

  const control = isValidElement(children)
    ? cloneElement(children, {
        id: children.props.id ?? id,
        invalid: Boolean(error),
        "aria-describedby": [errorId, hintId].filter(Boolean).join(" ") || undefined,
        "aria-required": required || undefined,
      })
    : children;

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {label ? (
        <div className="flex items-center justify-between gap-2">
          <label htmlFor={children?.props?.id ?? id} className="text-sm font-medium text-fg">
            {label}
            {required ? <span className="ms-0.5 text-danger">*</span> : null}
          </label>
          {labelAction}
        </div>
      ) : null}
      {control}
      {error ? (
        <p id={errorId} role="alert" className="text-sm text-danger">
          {error}
        </p>
      ) : hint ? (
        <p id={hintId} className="text-sm text-fg-subtle">
          {hint}
        </p>
      ) : null}
    </div>
  );
};

export const Input = forwardRef(function Input(
  { invalid, className, startIcon, endSlot, size = "md", ...props },
  ref,
) {
  const height = size === "lg" ? "h-12 text-base" : "h-10 text-sm";
  if (!startIcon && !endSlot) {
    return (
      <input
        ref={ref}
        aria-invalid={invalid || undefined}
        className={cn(controlBase, stateClass(invalid), height, "px-3", className)}
        {...props}
      />
    );
  }
  return (
    <div className="relative">
      {startIcon ? (
        <span className="pointer-events-none absolute inset-y-0 start-3 flex items-center text-fg-subtle">
          {startIcon}
        </span>
      ) : null}
      <input
        ref={ref}
        aria-invalid={invalid || undefined}
        className={cn(
          controlBase,
          stateClass(invalid),
          height,
          startIcon ? "ps-10" : "ps-3",
          endSlot ? "pe-11" : "pe-3",
          className,
        )}
        {...props}
      />
      {endSlot ? (
        <span className="absolute inset-y-0 end-1 flex items-center">{endSlot}</span>
      ) : null}
    </div>
  );
});

export const Textarea = forwardRef(function Textarea(
  { invalid, className, rows = 4, ...props },
  ref,
) {
  return (
    <textarea
      ref={ref}
      rows={rows}
      aria-invalid={invalid || undefined}
      className={cn(controlBase, stateClass(invalid), "px-3 py-2.5 text-sm", className)}
      {...props}
    />
  );
});

export const Select = forwardRef(function Select(
  { invalid, className, children, placeholder, ...props },
  ref,
) {
  return (
    <select
      ref={ref}
      aria-invalid={invalid || undefined}
      className={cn(controlBase, stateClass(invalid), "h-10 px-3 pe-8 text-sm", className)}
      {...props}
    >
      {placeholder ? <option value="">{placeholder}</option> : null}
      {children}
    </select>
  );
});
