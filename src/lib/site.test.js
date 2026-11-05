import { afterEach, describe, expect, test, vi } from "vitest";

const load = async (env) => {
  vi.resetModules();
  for (const [k, v] of Object.entries(env)) vi.stubEnv(k, v);
  return (await import("./site")).site;
};

afterEach(() => vi.unstubAllEnvs());

describe("site config", () => {
  test("uses the configured values", async () => {
    const site = await load({
      VITE_SITE_URL: "https://books.example.pk/",
      VITE_SUPPORT_EMAIL: "help@example.pk",
      VITE_SUPPORT_WHATSAPP: "+92 300 1234567",
    });
    expect(site.url).toBe("https://books.example.pk");
    expect(site.supportEmail).toBe("help@example.pk");
    expect(site.whatsapp).toBe("923001234567");
  });

  test("a local 03xx WhatsApp number gets the country code", async () => {
    expect((await load({ VITE_SUPPORT_WHATSAPP: "0300-1234567" })).whatsapp).toBe("923001234567");
  });

  test("placeholders from .env.example fall back instead of breaking pages", async () => {
    const site = await load({
      VITE_SITE_URL: "https://<your-domain>",
      VITE_SUPPORT_EMAIL: "<support-email>",
      VITE_SUPPORT_WHATSAPP: "",
    });
    expect(site.url).toBe(window.location.origin);
    expect(site.supportEmail).toBe(`support@${window.location.hostname}`);
    expect(site.whatsapp).toBe("");
  });
});
