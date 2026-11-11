import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import PublicLayout from "@/layout/PublicLayout";
import AdminLayout from "@/layout/AdminLayout";
import AuthLayout from "@/layout/AuthLayout";
import Home from "@/pages/Home";
import Catalog from "@/pages/Catalog";
import BookDetail from "@/pages/BookDetail";
import NotFound from "@/pages/system/NotFound";
import FullPageLoader from "@/pages/system/FullPageLoader";
import {
  ForgotPasswordPage,
  LoginPage,
  RegisterPage,
  ResetPasswordPage,
  TwoFactorVerifyPage,
  VerifyOtpPage,
} from "@/pages/Auth";
import { GuestOnly, RequireAuth } from "./guards";

const Profile = lazy(() => import("@/pages/Profile"));
const Plans = lazy(() => import("@/pages/Plans"));
const LegalPage = lazy(() => import("@/pages/Legal/LegalPage"));
const Contact = lazy(() => import("@/pages/Legal/Contact"));
const DeleteAccountHelp = lazy(() => import("@/pages/Legal/DeleteAccount"));
const RentBook = lazy(() => import("@/pages/Rent"));
const Library = lazy(() => import("@/pages/Library"));
const Payments = lazy(() => import("@/pages/Payments"));
const PaymentPage = lazy(() => import("@/pages/Payment"));
const Reader = lazy(() => import("@/pages/Reader"));
const Requests = lazy(() => import("@/pages/Requests"));
const RequestDetail = lazy(() => import("@/pages/RequestDetail"));
const MyRequests = lazy(() => import("@/pages/MyRequests"));
const Notifications = lazy(() => import("@/pages/Notifications"));
// Admin console (one chunk per screen).
const AdminDashboard = lazy(() => import("@/pages/Admin/Dashboard"));
const AdminPayments = lazy(() => import("@/pages/Admin/Payments"));
const AdminRentals = lazy(() => import("@/pages/Admin/Rentals"));
const AdminBooks = lazy(() => import("@/pages/Admin/Books"));
const AdminBookEditor = lazy(() => import("@/pages/Admin/BookEditor"));
const AdminRequests = lazy(() => import("@/pages/Admin/Requests"));
const AdminCategories = lazy(() => import("@/pages/Admin/Categories"));
const AdminPackages = lazy(() => import("@/pages/Admin/Packages"));
const AdminUsers = lazy(() => import("@/pages/Admin/Users"));
const AdminLogs = lazy(() => import("@/pages/Admin/Logs")); // Dev-only component gallery; the import is dropped from production builds.
const DesignSystem = import.meta.env.DEV ? lazy(() => import("@/pages/system/DesignSystem")) : null;

/**
 * Every URL in the app.
 *  - Public (anyone):        /, /books, /books/:bookId, /requests, /plans
 *  - Guests only:            /login, /signup, /verify-otp, /forgot-password, …
 *  - Signed-in readers:      /account/*, /read/:bookId
 *  - Admin console:          /admin/*
 * Placeholders name the frontend phase that builds them.
 */
const AppRoutes = () => (
  <Suspense fallback={<FullPageLoader />}>
    <Routes>
      {/* Sign-in flow (guests only; signed-in users are sent on). */}
      <Route element={<GuestOnly />}>
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<RegisterPage />} />
          <Route path="/verify-otp" element={<VerifyOtpPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
          <Route path="/two-factor" element={<TwoFactorVerifyPage />} />
        </Route>
      </Route>

      <Route element={<PublicLayout />}>
        <Route index element={<Home />} />
        <Route path="/books" element={<Catalog />} />
        <Route path="/books/:bookId" element={<BookDetail />} />
        <Route path="/requests" element={<Requests />} />
        <Route path="/requests/:requestId" element={<RequestDetail />} />
        <Route path="/plans" element={<Plans />} />
        <Route path="/privacy" element={<LegalPage key="privacy" name="privacy" />} />
        <Route path="/terms" element={<LegalPage key="terms" name="terms" />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/delete-account" element={<DeleteAccountHelp />} />

        <Route element={<RequireAuth />}>
          <Route path="/books/:bookId/rent" element={<RentBook />} />
          <Route path="/account" element={<Library />} />
          <Route path="/account/rentals" element={<Navigate to="/account" replace />} />
          <Route path="/account/payments" element={<Payments />} />
          <Route path="/account/payments/:paymentId" element={<PaymentPage />} />
          <Route path="/account/requests" element={<MyRequests />} />
          <Route path="/account/notifications" element={<Notifications />} />
          <Route path="/account/profile" element={<Profile />} />
        </Route>

        {import.meta.env.DEV ? <Route path="/dev/design" element={<DesignSystem />} /> : null}
        <Route path="*" element={<NotFound />} />
      </Route>

      {/* The reader is full-screen (no site header). */}
      <Route element={<RequireAuth />}>
        <Route path="/read/:bookId" element={<Reader />} />
      </Route>

      <Route path="/admin" element={<RequireAuth role="admin" />}>
        <Route element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="payments" element={<AdminPayments />} />
          <Route path="rentals" element={<AdminRentals />} />
          <Route path="books" element={<AdminBooks />} />
          <Route path="books/new" element={<AdminBookEditor />} />
          <Route path="books/:bookId" element={<AdminBookEditor />} />
          <Route path="requests" element={<AdminRequests />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="packages" element={<AdminPackages />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="logs" element={<AdminLogs />} />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Route>
      </Route>
    </Routes>
  </Suspense>
);

export default AppRoutes;
