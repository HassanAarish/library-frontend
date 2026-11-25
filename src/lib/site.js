/**
 * Public, deploy-time facts about the site (from VITE_* env). Used by the
 * contact page, the legal pages and SEO tags.
 */
const env = import.meta.env;

// A placeholder or malformed VITE_SITE_URL falls back to the current origin.
const configured = URL.canParse(env.VITE_SITE_URL ?? "") ? env.VITE_SITE_URL : "";
const origin = (
  configured || (typeof window !== "undefined" ? window.location.origin : "")
).replace(/\/+$/, "");

export const site = {
  name: "LibraryHub",
  url: origin,
  // Set VITE_SUPPORT_EMAIL; the fallback (also for a placeholder value) only
  // keeps mail on this site's own domain.
  supportEmail: /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(env.VITE_SUPPORT_EMAIL ?? "")
    ? env.VITE_SUPPORT_EMAIL
    : `support@${typeof window !== "undefined" ? window.location.hostname : "localhost"}`,
  // Digits in international format, e.g. 923001234567. A local 03xx number is
  // converted, since wa.me links need the country code. Empty hides WhatsApp.
  whatsapp: (env.VITE_SUPPORT_WHATSAPP || "").replace(/\D/g, "").replace(/^0(?=3\d{9}$)/, "92"),
};

/** Absolute URL for a path on this site (canonical links, og:url). */
export const absoluteUrl = (path = "/") => `${site.url}${path.startsWith("/") ? path : `/${path}`}`;
