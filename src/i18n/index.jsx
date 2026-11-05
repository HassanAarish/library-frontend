import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import en from "./locales/en";

/**
 * Minimal translation layer. Today only English ships; Urdu is added by
 * creating locales/ur.js with the same keys and listing it in LOCALES. The
 * provider sets <html lang dir>, so `dir="rtl"` mirrors every layout built
 * with logical utilities (ms-/me-, ps-/pe-, start-/end-).
 */
// eslint-disable-next-line react-refresh/only-export-components
export const LOCALES = {
  en: { label: "English", dir: "ltr", messages: en, intl: "en-PK" },
  // ur: { label: "اردو", dir: "rtl", messages: ur, intl: "ur-PK" },
};

const DEFAULT_LOCALE = "en";
const STORAGE_KEY = "locale";

const lookup = (messages, key) =>
  key.split(".").reduce((node, part) => (node == null ? node : node[part]), messages);

const interpolate = (text, vars) =>
  text.replace(/\{(\w+)\}/g, (match, name) => (vars[name] ?? match).toString());

const I18nContext = createContext(null);

export const I18nProvider = ({ children }) => {
  const [locale, setLocaleState] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return LOCALES[saved] ? saved : DEFAULT_LOCALE;
    } catch {
      return DEFAULT_LOCALE;
    }
  });

  const config = LOCALES[locale];

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = config.dir;
  }, [locale, config.dir]);

  const setLocale = useCallback((next) => {
    if (!LOCALES[next]) return;
    setLocaleState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // private mode: keep it for this visit only
    }
  }, []);

  /**
   * t("nav.signIn") · t("common.pageOf", { page: 2, total: 9 }) ·
   * t("notifications.unread", { count: 3 }) picks the plural form.
   * Missing keys fall back to English, then to the key itself (easy to spot).
   */
  const t = useCallback(
    (key, vars = {}) => {
      let value = lookup(config.messages, key) ?? lookup(en, key);
      if (value && typeof value === "object" && "other" in value) {
        const rule = new Intl.PluralRules(config.intl).select(Number(vars.count ?? 0));
        value = value[rule] ?? value.other;
      }
      if (typeof value !== "string") {
        if (import.meta.env.DEV) console.warn(`[i18n] missing key: ${key}`);
        return key;
      }
      return interpolate(value, vars);
    },
    [config],
  );

  const formatters = useMemo(
    () => ({
      number: (n) => new Intl.NumberFormat(config.intl).format(n),
      // Prices are whole rupees.
      price: (n) => t("common.currency", { amount: new Intl.NumberFormat(config.intl).format(n) }),
      date: (d, opts = { dateStyle: "medium" }) =>
        new Intl.DateTimeFormat(config.intl, { timeZone: "Asia/Karachi", ...opts }).format(
          new Date(d),
        ),
      dateTime: (d) =>
        new Intl.DateTimeFormat(config.intl, {
          timeZone: "Asia/Karachi",
          dateStyle: "medium",
          timeStyle: "short",
        }).format(new Date(d)),
      relative: (d) => {
        const diff = (new Date(d).getTime() - Date.now()) / 1000;
        const rtf = new Intl.RelativeTimeFormat(config.intl, { numeric: "auto" });
        const steps = [
          [60, "second"],
          [3600, "minute", 60],
          [86400, "hour", 3600],
          [604800, "day", 86400],
          [2629800, "week", 604800],
          [31557600, "month", 2629800],
          [Infinity, "year", 31557600],
        ];
        const abs = Math.abs(diff);
        const [, unit, size = 1] = steps.find(([limit]) => abs < limit);
        return rtf.format(Math.round(diff / size), unit);
      },
    }),
    [config.intl, t],
  );

  const value = useMemo(
    () => ({ locale, dir: config.dir, setLocale, t, ...formatters }),
    [locale, config.dir, setLocale, t, formatters],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useI18n = () => {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used inside <I18nProvider>");
  return ctx;
};
