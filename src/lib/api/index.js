import { cleanParams, http, unwrap, unwrapWithMessage, upload } from "@/lib/http";

/**
 * One function per backend endpoint, grouped by area. Every function returns
 * the response's `data` (or `{ data, message }` where the wording matters) and
 * rejects with an ApiError. See the backend README for request/response shapes.
 */

export const auth = {
  register: (body) => unwrapWithMessage(http.post("/auth/register", body)),
  verifyOtp: (body) => unwrapWithMessage(http.post("/auth/verify-otp", body)),
  resendOtp: (body) => unwrapWithMessage(http.post("/auth/resend-otp", body)),
  // → raw: { token } or { twoFactorRequired, pendingToken }
  login: (body) => unwrapWithMessage(http.post("/auth/login", body)),
  // → raw: { token } | { twoFactorRequired, pendingToken } | { linkRequired, email }
  social: (body) => unwrapWithMessage(http.post("/auth/social", body)),
  forgotPassword: (body) => unwrapWithMessage(http.post("/auth/forgot-password", body)),
  resetPassword: (token, body) =>
    unwrapWithMessage(http.post("/auth/reset-password", body, { params: { token } })),
};

export const twoFactor = {
  setup: () => unwrap(http.post("/twofactor/setup")),
  enable: (code) => unwrapWithMessage(http.post("/twofactor/enable", { code })),
  disable: (code) => unwrapWithMessage(http.post("/twofactor/disable", { code })),
  verify: (body) => unwrapWithMessage(http.post("/twofactor/verify", body)),
};

export const user = {
  profile: () => unwrap(http.get("/user/profile")), // { user, preferences }
  updateProfile: (body) => unwrapWithMessage(http.put("/user/profile-update", body)),
  updatePassword: (body) => unwrapWithMessage(http.patch("/user/password-update", body)),
  setProfilePicture: (profilePicture) =>
    unwrapWithMessage(http.patch("/user/profile-picture", { profilePicture })),
  removeProfilePicture: () => unwrapWithMessage(http.delete("/user/remove-profile-picture")),
};

export const files = {
  // Images only; returns [{ name, url, public_id }]
  uploadImages: (fileList, opts) => {
    const form = new FormData();
    [...fileList].forEach((f) => form.append("files", f));
    return unwrap(upload("/common/upload", form, opts));
  },
  remove: (publicIds) =>
    unwrap(
      http.post(
        "/common/remove",
        Array.isArray(publicIds) ? { publicIds } : { public_id: publicIds },
      ),
    ),
};

export const books = {
  // ?search, category, language, sort (newest|oldest|price_asc|price_desc|title), page, limit
  catalog: (params) => unwrap(http.get("/book", { params: cleanParams(params) })),
  get: (bookId) => unwrap(http.get(`/book/${bookId}`)),
};

export const categories = {
  list: (params) => unwrap(http.get("/category", { params: cleanParams(params) })),
  mine: (params) => unwrap(http.get("/category/mine", { params: cleanParams(params) })),
  suggest: (body) => unwrapWithMessage(http.post("/category", body)),
};

export const rentals = {
  availability: (bookId) => unwrap(http.get(`/rental/availability/${bookId}`)),
  // body: { bookId, startDate?, paymentMethod: "single"|"credit", method? } → { rental, payment? }
  create: (body) => unwrapWithMessage(http.post("/rental", body)),
  mine: (params) => unwrap(http.get("/rental/mine", { params: cleanParams(params) })),
  get: (rentalId) => unwrap(http.get(`/rental/${rentalId}`)),
  cancel: (rentalId) => unwrapWithMessage(http.post(`/rental/${rentalId}/cancel`)),
  extend: (rentalId) => unwrapWithMessage(http.post(`/rental/${rentalId}/extend`)),
  returnEarly: (rentalId) => unwrapWithMessage(http.post(`/rental/${rentalId}/return`)),
  startNow: (rentalId) => unwrapWithMessage(http.post(`/rental/${rentalId}/start-now`)),
};

export const reader = {
  open: (bookId) => unwrap(http.get(`/reader/${bookId}`)),
  // Page images are fetched as blobs so the URL never points at a file.
  page: (bookId, page, { signal } = {}) =>
    http
      .get(`/reader/${bookId}/pages/${page}`, { responseType: "blob", signal })
      .then((res) => res.data),
};

export const payments = {
  methods: () => unwrap(http.get("/payment/methods")),
  mine: (params) => unwrap(http.get("/payment/mine", { params: cleanParams(params) })),
  get: (paymentId) => unwrap(http.get(`/payment/${paymentId}`)),
  uploadProof: (file, opts) => {
    const form = new FormData();
    form.append("file", file);
    return unwrap(upload("/payment/proof-upload", form, opts));
  },
  // body: { transactionId, senderNumber, senderName?, screenshot: { public_id } }
  submitProof: (paymentId, body) =>
    unwrapWithMessage(http.post(`/payment/${paymentId}/proof`, body)),
};

export const packages = {
  plans: () => unwrap(http.get("/package/plans")),
  mine: () => unwrap(http.get("/package/mine")), // { creditsAvailable, nextExpiry, packages }
  purchase: (planId, method) =>
    unwrapWithMessage(http.post("/package/purchase", { planId, method })),
  cancel: (userPackageId) => unwrapWithMessage(http.post(`/package/${userPackageId}/cancel`)),
};

export const reviews = {
  create: (bookId, body) => unwrapWithMessage(http.post(`/review/${bookId}`, body)),
};

export const bookRequests = {
  // ?search, status, language, sort (popular|newest|oldest), page, limit
  list: (params) => unwrap(http.get("/bookrequest", { params: cleanParams(params) })),
  get: (requestId) => unwrap(http.get(`/bookrequest/${requestId}`)),
  mine: (params) => unwrap(http.get("/bookrequest/mine", { params: cleanParams(params) })),
  // → { request, joined, alreadyFollowing? } | { alreadyInLibrary }
  create: (body) => unwrapWithMessage(http.post("/bookrequest", body)),
  follow: (requestId, note) =>
    unwrapWithMessage(http.post(`/bookrequest/${requestId}/follow`, { note })),
  unfollow: (requestId) => unwrapWithMessage(http.delete(`/bookrequest/${requestId}/follow`)),
};

export const notifications = {
  list: (params) => unwrap(http.get("/notification", { params: cleanParams(params) })),
  unreadCount: () => unwrap(http.get("/notification/unread-count")),
  markRead: (ids) => unwrap(http.patch("/notification/read", { ids })),
  markAllRead: () => unwrap(http.patch("/notification/read-all")),
  remove: (notificationId) => unwrap(http.delete(`/notification/${notificationId}`)),
};

export const admin = {
  users: (params) => unwrap(http.get("/admin/users", { params: cleanParams(params) })),
  user: (userId) => unwrap(http.get(`/admin/user/${userId}`)),
  toggleBlock: (userId) => unwrapWithMessage(http.patch(`/admin/toggle-user-block/${userId}`)),
  auditLogs: (params) => unwrap(http.get("/admin/audit-logs", { params: cleanParams(params) })),
  requestLogs: (params) => unwrap(http.get("/admin/request-logs", { params: cleanParams(params) })),

  books: (params) => unwrap(http.get("/book/admin", { params: cleanParams(params) })),
  book: (bookId) => unwrap(http.get(`/book/admin/${bookId}`)),
  uploadBookFile: (file, opts) => {
    const form = new FormData();
    form.append("file", file);
    return unwrap(upload("/book/upload-file", form, opts));
  },
  createBook: (body) => unwrapWithMessage(http.post("/book", body)),
  updateBook: (bookId, body) => unwrapWithMessage(http.patch(`/book/${bookId}`, body)),
  setBookStatus: (bookId, status) =>
    unwrapWithMessage(http.patch(`/book/${bookId}/status`, { status })),

  categories: (params) => unwrap(http.get("/category", { params: cleanParams(params) })),
  createCategory: (body) => unwrapWithMessage(http.post("/category", body)),
  updateCategory: (categoryId, body) =>
    unwrapWithMessage(http.patch(`/category/${categoryId}`, body)),
  deleteCategory: (categoryId) => unwrapWithMessage(http.delete(`/category/${categoryId}`)),

  rentals: (params) => unwrap(http.get("/rental/admin", { params: cleanParams(params) })),

  payments: (params) => unwrap(http.get("/payment/admin", { params: cleanParams(params) })),
  approvePayment: (paymentId) =>
    unwrapWithMessage(http.patch(`/payment/admin/${paymentId}/approve`)),
  rejectPayment: (paymentId, reason) =>
    unwrapWithMessage(http.patch(`/payment/admin/${paymentId}/reject`, { reason })),
  resolveRefund: (paymentId, body) =>
    unwrapWithMessage(http.patch(`/payment/admin/${paymentId}/refund`, body)),

  plans: () => unwrap(http.get("/package/admin/plans")),
  createPlan: (body) => unwrapWithMessage(http.post("/package/admin/plans", body)),
  updatePlan: (planId, body) =>
    unwrapWithMessage(http.patch(`/package/admin/plans/${planId}`, body)),
  purchases: (params) =>
    unwrap(http.get("/package/admin/purchases", { params: cleanParams(params) })),

  bookRequests: (params) => unwrap(http.get("/bookrequest/admin", { params: cleanParams(params) })),
  bookRequest: (requestId) => unwrap(http.get(`/bookrequest/admin/${requestId}`)),
  setRequestStatus: (requestId, body) =>
    unwrapWithMessage(http.patch(`/bookrequest/admin/${requestId}/status`, body)),
  fulfillRequest: (requestId, body) =>
    unwrapWithMessage(http.post(`/bookrequest/admin/${requestId}/fulfill`, body)),
  mergeRequest: (requestId, intoId) =>
    unwrapWithMessage(http.post(`/bookrequest/admin/${requestId}/merge`, { intoId })),
};
