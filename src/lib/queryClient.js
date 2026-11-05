import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      refetchOnWindowFocus: false,
      // Retry network blips and 5xx once; never retry 4xx (they won't change).
      retry: (failureCount, error) => failureCount < 1 && (!error?.status || error.status >= 500),
    },
    mutations: { retry: false },
  },
});

/**
 * Every cache key in one place, so live updates (sockets) and mutations
 * invalidate exactly what changed. Shape: [area, kind, ...params].
 */
export const qk = {
  profile: ["user", "profile"],

  catalog: (params) => ["books", "catalog", params],
  book: (bookId) => ["books", "detail", bookId],
  categories: (params) => ["categories", "list", params],
  myCategories: ["categories", "mine"],

  availability: (bookId) => ["rentals", "availability", String(bookId)],
  myRentals: (params) => ["rentals", "mine", params],
  rental: (rentalId) => ["rentals", "detail", rentalId],

  paymentMethods: ["payments", "methods"],
  myPayments: (params) => ["payments", "mine", params],
  payment: (paymentId) => ["payments", "detail", paymentId],

  plans: ["packages", "plans"],
  myPackages: ["packages", "mine"],

  bookRequests: (params) => ["bookRequests", "list", params],
  bookRequest: (requestId) => ["bookRequests", "detail", requestId],
  myBookRequests: (params) => ["bookRequests", "mine", params],

  notifications: (params) => ["notifications", "list", params],
  unreadCount: ["notifications", "unread"],

  admin: (area, params) => ["admin", area, params],
};
