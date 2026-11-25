/** Join class names, skipping falsy values: cn("a", cond && "b", ["c"]). */
export const cn = (...parts) => parts.flat(Infinity).filter(Boolean).join(" ");
