import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { I18nProvider } from "@/i18n";

/** Renders inside the providers most components need: i18n and a router at `path`. */
export const renderWithApp = (ui, { path = "/" } = {}) =>
  render(
    <I18nProvider>
      <MemoryRouter initialEntries={[path]}>{ui}</MemoryRouter>
    </I18nProvider>,
  );
