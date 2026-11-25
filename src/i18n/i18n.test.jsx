import { describe, expect, test, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { I18nProvider, useI18n } from "@/i18n";
import en from "./locales/en";

const wrapper = ({ children }) => <I18nProvider>{children}</I18nProvider>;
const setup = () => renderHook(() => useI18n(), { wrapper }).result.current;

describe("i18n", () => {
  test("looks up nested keys and fills {vars}", () => {
    const { t } = setup();
    expect(t("footer.privacy")).toBe("Privacy policy");
    expect(t("footer.rights", { year: 2026 })).toBe("© 2026 LibraryHub. All rights reserved.");
  });

  test("picks the plural form from count", () => {
    const { t } = setup();
    expect(t("catalog.results", { count: 1 })).toBe("1 book");
    expect(t("catalog.results", { count: 3 })).toBe("3 books");
  });

  test("a missing key comes back as the key itself", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    expect(setup().t("nope.missing")).toBe("nope.missing");
    warn.mockRestore();
  });

  test("sets <html lang dir> for the locale", () => {
    setup();
    expect(document.documentElement.lang).toBe("en");
    expect(document.documentElement.dir).toBe("ltr");
  });

  test("prices are whole rupees in the Pakistan format", () => {
    expect(setup().price(1250)).toBe("Rs 1,250");
  });

  test("every leaf message is a string or a plural object", () => {
    const bad = [];
    const walk = (node, path) => {
      if (typeof node === "string") return;
      if (node && typeof node === "object" && "other" in node) return;
      if (node && typeof node === "object") {
        Object.entries(node).forEach(([k, v]) => walk(v, path ? `${path}.${k}` : k));
        return;
      }
      bad.push(path);
    };
    walk(en, "");
    expect(bad).toEqual([]);
  });
});
