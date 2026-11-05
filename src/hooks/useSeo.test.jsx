import { useState } from "react";
import { describe, expect, test } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithApp } from "@/test/render";
import { useSeo } from "./useSeo";

const Page = (props) => {
  useSeo(props);
  return null;
};

const tag = (selector, attr = "content") =>
  document.head.querySelector(selector)?.getAttribute(attr);

describe("useSeo", () => {
  test("sets title, description, canonical and Open Graph tags", () => {
    renderWithApp(<Page title="Sapiens" description="A brief history." type="book" />, {
      path: "/books/1",
    });
    expect(document.title).toBe("Sapiens · LibraryHub");
    expect(tag("meta[name=description]")).toBe("A brief history.");
    expect(tag("link[rel=canonical]", "href")).toMatch(/\/books\/1$/);
    expect(tag("meta[property='og:type']")).toBe("book");
    expect(tag("meta[property='og:title']")).toBe("Sapiens · LibraryHub");
    expect(tag("meta[name=robots]")).toBeUndefined();
  });

  test("falls back to the site defaults", () => {
    renderWithApp(<Page />);
    expect(document.title).toBe("LibraryHub: rent and read books online");
    expect(tag("meta[name=description]")).toMatch(/Rent books online in Pakistan/);
    expect(tag("meta[property='og:image']")).toMatch(/\/og-image\.png$/);
  });

  test.each(["/account", "/admin/payments", "/read/abc", "/login", "/books/abc/rent"])(
    "%s is kept out of search results",
    (path) => {
      renderWithApp(<Page title="Private" />, { path });
      expect(tag("meta[name=robots]")).toBe("noindex, nofollow");
      expect(document.head.querySelector("link[rel=canonical]")).toBeNull();
    },
  );

  test("writes JSON-LD and removes it when the page has none", async () => {
    const Toggle = () => {
      const [book, setBook] = useState(true);
      return (
        <>
          <Page title="Book" jsonLd={book ? { "@type": "Book", name: "X" } : undefined} />
          <button type="button" onClick={() => setBook(false)}>
            leave
          </button>
        </>
      );
    };
    renderWithApp(<Toggle />);
    expect(JSON.parse(document.getElementById("seo-jsonld").textContent)).toEqual({
      "@type": "Book",
      name: "X",
    });
    await userEvent.click(screen.getByRole("button", { name: "leave" }));
    expect(document.getElementById("seo-jsonld")).toBeNull();
  });
});
