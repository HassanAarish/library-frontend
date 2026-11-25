import { useEffect, useState } from "react";

/**
 * Live time left until `until` (e.g. a payment hold): { left, text, done }.
 * text is "12:34" under an hour, "3h 05m" above. null when there's no end.
 */
export const useCountdown = (until) => {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!until) return undefined;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [until]);

  if (!until) return null;
  const left = Math.max(0, new Date(until).getTime() - now);
  const minutes = Math.floor(left / 60000);
  const seconds = Math.floor((left % 60000) / 1000);
  const hours = Math.floor(minutes / 60);
  const text =
    hours > 0
      ? `${hours}h ${String(minutes % 60).padStart(2, "0")}m`
      : `${minutes}:${String(seconds).padStart(2, "0")}`;
  return { left, text, done: left === 0 };
};
