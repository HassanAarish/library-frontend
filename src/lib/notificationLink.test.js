import { describe, expect, test } from "vitest";
import { notificationLink } from "./notificationLink";

describe("notificationLink", () => {
  test("readers go to the thing the notification is about", () => {
    expect(notificationLink({ type: "payment.approved", data: { paymentId: "p1" } })).toBe(
      "/account/payments/p1",
    );
    expect(notificationLink({ type: "refund.refunded", data: {} })).toBe("/account/payments");
    expect(notificationLink({ type: "rental.started", data: {} })).toBe("/account");
    expect(notificationLink({ type: "package.expiring", data: {} })).toBe("/plans");
    expect(notificationLink({ type: "book_request.updated", data: { requestId: "r1" } })).toBe(
      "/requests/r1",
    );
    expect(notificationLink({ type: "category.approved", data: {} })).toBe("/account/requests");
    expect(notificationLink({ type: "book.available", data: { bookId: "b1" } })).toBe("/books/b1");
    expect(notificationLink({ type: "system.notice", data: {} })).toBeNull();
  });

  test("admins go to the review queue", () => {
    const admin = { isAdmin: true };
    expect(notificationLink({ type: "payment.submitted", data: { paymentId: "p" } }, admin)).toBe(
      "/admin/payments",
    );
    expect(notificationLink({ type: "refund.requested" }, admin)).toBe("/admin/payments");
    expect(notificationLink({ type: "book_request.created" }, admin)).toBe("/admin/requests");
    expect(notificationLink({ type: "category.proposed" }, admin)).toBe("/admin/categories");
  });
});
