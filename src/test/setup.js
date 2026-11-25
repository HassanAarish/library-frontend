import "@testing-library/jest-dom/vitest";
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

afterEach(() => {
  cleanup();
  document.head
    .querySelectorAll("meta, link[rel=canonical], script#seo-jsonld")
    .forEach((el) => el.remove());
  localStorage.clear();
});
