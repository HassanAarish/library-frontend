import { describe, expect, test, vi } from "vitest";
import { render, renderHook, act, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { I18nProvider } from "@/i18n";
import { useCountdown } from "@/hooks/useCountdown";
import { Avatar, DetailList, EmptyState, Field, Input, Segmented } from "@/ui";

const withI18n = (ui) => render(<I18nProvider>{ui}</I18nProvider>);

describe("Avatar", () => {
  test("initials are drawn, not text, so they never rename a labelled button", () => {
    render(
      <button type="button" aria-label="Account">
        <Avatar name="Ayesha Khan" />
      </button>,
    );
    const button = screen.getByRole("button", { name: "Account" });
    expect(button.textContent).toBe("");
    expect(button.querySelector("[data-initials]")).toHaveAttribute("data-initials", "AK");
  });

  test("shows the photo with the name as alt text", () => {
    render(<Avatar name="Bilal" src="https://x/p.jpg" />);
    expect(screen.getByRole("img", { name: "Bilal" })).toBeInTheDocument();
  });
});

describe("Field", () => {
  test("links the label, hint and error to the control", () => {
    withI18n(
      <Field label="Email" hint="We never share it." error="Enter a valid email">
        <Input />
      </Field>,
    );
    const input = screen.getByLabelText("Email");
    expect(input).toHaveAccessibleDescription(/We never share it\.|Enter a valid email/);
    expect(input).toHaveAttribute("aria-invalid", "true");
  });
});

describe("Segmented", () => {
  test("marks the current option and reports clicks", async () => {
    const onChange = vi.fn();
    render(
      <Segmented
        label="Status"
        value="a"
        onChange={onChange}
        options={[
          ["a", "All"],
          ["b", "Open", 3],
        ]}
      />,
    );
    expect(screen.getByRole("button", { name: "All" })).toHaveAttribute("aria-pressed", "true");
    await userEvent.click(screen.getByRole("button", { name: /Open/ }));
    expect(onChange).toHaveBeenCalledWith("b");
  });
});

describe("DetailList and EmptyState", () => {
  test("DetailList skips empty values", () => {
    render(
      <DetailList
        items={[
          ["Name", "Bilal"],
          ["Phone", null],
          ["Note", ""],
        ]}
      />,
    );
    expect(screen.getByText("Name")).toBeInTheDocument();
    expect(screen.queryByText("Phone")).toBeNull();
    expect(screen.queryByText("Note")).toBeNull();
  });

  test("EmptyState heading level can be set", () => {
    render(<EmptyState title="Nothing here." as="h3" />);
    expect(screen.getByRole("heading", { level: 3, name: "Nothing here." })).toBeInTheDocument();
  });
});

describe("useCountdown", () => {
  test("counts down and finishes", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-11-05T10:00:00Z"));
    const { result } = renderHook(() => useCountdown("2026-11-05T10:01:05Z"));
    expect(result.current.text).toBe("1:05");
    act(() => vi.advanceTimersByTime(65_000));
    expect(result.current.done).toBe(true);
    vi.useRealTimers();
  });

  test("shows hours above an hour, null without an end", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-11-05T10:00:00Z"));
    expect(renderHook(() => useCountdown("2026-11-05T13:05:00Z")).result.current.text).toBe(
      "3h 05m",
    );
    expect(renderHook(() => useCountdown(null)).result.current).toBeNull();
    vi.useRealTimers();
  });
});
