/**
 * Where a notification takes you when clicked, from its type and data ids
 * (see the backend's NOTIFICATION_TYPES). null = nothing to open.
 */
export const notificationLink = (n, { isAdmin } = {}) => {
  const d = n?.data ?? {};
  const area = n?.type?.split(".")[0];

  if (isAdmin) {
    if (n.type === "payment.submitted" || n.type === "refund.requested") return "/admin/payments";
    if (n.type === "book_request.created") return "/admin/requests";
    if (n.type === "category.proposed") return "/admin/categories";
  }

  switch (area) {
    case "payment":
    case "refund":
      return d.paymentId ? `/account/payments/${d.paymentId}` : "/account/payments";
    case "rental":
      return "/account";
    case "package":
      return "/plans";
    case "book_request":
      return d.requestId ? `/requests/${d.requestId}` : "/account/requests";
    case "category":
      return "/account/requests";
    default:
      return d.bookId ? `/books/${d.bookId}` : null;
  }
};
