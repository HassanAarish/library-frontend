import { useI18n } from "@/i18n";
import { site } from "@/lib/site";
import en from "./en";

// Add a locale by creating ./ur.js with the same shape and listing it here.
const CONTENT = { en };

const fill = (text) =>
  text.replace(
    /\{(email|whatsapp)\}/g,
    (_, k) => site[k === "email" ? "supportEmail" : "whatsapp"],
  );

/** Deep-fills {email}/{whatsapp} in every string of a content tree. */
const fillAll = (node) => {
  if (typeof node === "string") return fill(node);
  if (Array.isArray(node)) return node.map(fillAll);
  if (node && typeof node === "object")
    return Object.fromEntries(Object.entries(node).map(([k, v]) => [k, fillAll(v)]));
  return node;
};

/** usePageContent("privacy") → the document in the current language (English fallback). */
export const usePageContent = (name) => {
  const { locale } = useI18n();
  return fillAll((CONTENT[locale] ?? en)[name] ?? en[name]);
};
