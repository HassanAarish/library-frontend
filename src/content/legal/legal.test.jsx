import { describe, expect, test } from "vitest";
import { screen } from "@testing-library/react";
import { Route, Routes } from "react-router-dom";
import { renderWithApp } from "@/test/render";
import LegalPage from "@/pages/Legal/LegalPage";
import Contact from "@/pages/Legal/Contact";
import en from "./en";

const NO_DOWNLOAD = /licensed for on-platform reading only/;

const allText = (doc) => JSON.stringify(doc);

describe("legal content", () => {
  test("privacy and terms both carry the no-download rule", () => {
    expect(allText(en.privacy)).toMatch(NO_DOWNLOAD);
    expect(allText(en.terms)).toMatch(NO_DOWNLOAD);
    expect(allText(en.terms)).toMatch(/permanently blocked.*will not receive a refund/);
  });

  test("section ids are unique (they are the #anchors)", () => {
    for (const doc of [en.privacy, en.terms]) {
      const ids = doc.sections.map((s) => s.id);
      expect(new Set(ids).size).toBe(ids.length);
    }
  });

  test("the terms page renders its contents list and sections", () => {
    renderWithApp(
      <Routes>
        <Route path="/terms" element={<LegalPage name="terms" />} />
      </Routes>,
      { path: "/terms" },
    );
    expect(screen.getByRole("heading", { level: 1, name: "Terms of use" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Cancellations and refunds/ })).toHaveAttribute(
      "href",
      "#refunds",
    );
    expect(screen.getAllByRole("note")[0]).toHaveTextContent(NO_DOWNLOAD);
    expect(document.title).toBe("Terms of use · LibraryHub");
  });

  test("the privacy page fills in the support email", () => {
    renderWithApp(
      <Routes>
        <Route path="/privacy" element={<LegalPage name="privacy" />} />
      </Routes>,
      { path: "/privacy" },
    );
    expect(document.body.textContent).not.toContain("{email}");
    expect(document.body.textContent).toMatch(/support@/);
  });

  test("contact shows the email link and the FAQ", () => {
    renderWithApp(<Contact />, { path: "/contact" });
    expect(screen.getByRole("link", { name: /^support@/ }).getAttribute("href")).toMatch(
      /^mailto:support@/,
    );
    expect(screen.getByText("Can I download a book to read offline?")).toBeInTheDocument();
  });
});
