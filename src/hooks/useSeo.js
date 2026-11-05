import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { absoluteUrl, site } from "@/lib/site";

const DEFAULT_TITLE = "LibraryHub: rent and read books online";
const DEFAULT_DESCRIPTION =
  "Rent books online in Pakistan. Browse the catalogue, book a title for now or later, and read it in your browser.";

// Signed-in and transactional screens: keep them out of search results.
const PRIVATE =
  /^\/(account|admin|read|login|signup|verify-otp|forgot-password|reset-password|two-factor|dev)\b|\/rent$/;

/** Finds or creates <meta>/<link> in <head> and sets one attribute. */
const setTag = (selector, create, attr, value) => {
  let el = document.head.querySelector(selector);
  if (value == null || value === "") {
    el?.remove();
    return;
  }
  if (!el) {
    el = create();
    document.head.appendChild(el);
  }
  el.setAttribute(attr, value);
};

const meta = (key, value, by = "name") =>
  setTag(
    `meta[${by}="${key}"]`,
    () => {
      const m = document.createElement("meta");
      m.setAttribute(by, key);
      return m;
    },
    "content",
    value,
  );

/**
 * Title, description, canonical, Open Graph/Twitter tags and optional JSON-LD
 * for the current page. Signed-in screens get `noindex` automatically.
 *
 *   useSeo({ title: book.title, description: book.description, image: coverUrl,
 *            type: "book", jsonLd: {...} })
 */
export const useSeo = ({ title, description, image, type = "website", jsonLd, noindex } = {}) => {
  const { pathname } = useLocation();
  const jsonText = jsonLd ? JSON.stringify(jsonLd) : "";

  useEffect(() => {
    const fullTitle = title ? `${title} · ${site.name}` : DEFAULT_TITLE;
    const desc = (description || DEFAULT_DESCRIPTION).replace(/\s+/g, " ").trim().slice(0, 300);
    const url = absoluteUrl(pathname);
    const hidden = noindex ?? PRIVATE.test(pathname);

    document.title = fullTitle;
    meta("description", desc);
    meta("robots", hidden ? "noindex, nofollow" : null);
    setTag(
      'link[rel="canonical"]',
      () => {
        const l = document.createElement("link");
        l.rel = "canonical";
        return l;
      },
      "href",
      hidden ? null : url,
    );

    meta("og:site_name", site.name, "property");
    meta("og:type", type, "property");
    meta("og:title", fullTitle, "property");
    meta("og:description", desc, "property");
    meta("og:url", url, "property");
    meta(
      "og:image",
      image ? new URL(image, absoluteUrl("/")).href : absoluteUrl("/og-image.png"),
      "property",
    );
    meta("twitter:card", image ? "summary" : "summary_large_image");

    let script = document.getElementById("seo-jsonld");
    if (jsonText) {
      if (!script) {
        script = document.createElement("script");
        script.type = "application/ld+json";
        script.id = "seo-jsonld";
        document.head.appendChild(script);
      }
      script.textContent = jsonText;
    } else {
      script?.remove();
    }
  }, [title, description, image, type, jsonText, noindex, pathname]);
};
