import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import PublicLayout from "@/layout/PublicLayout";
import AdminLayout from "@/layout/AdminLayout";
import LegacyScreen from "@/layout/LegacyScreen";
import Home from "@/pages/Home";
import ComingSoon from "@/pages/system/ComingSoon";
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
// Dev-only component gallery; the import is dropped from production builds.
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
      {/* Sign-in flow: full-screen legacy screens until F2 rebuilds them. */}
      <Route element={<GuestOnly />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<RegisterPage />} />
        <Route path="/verify-otp" element={<VerifyOtpPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
        <Route path="/two-factor" element={<TwoFactorVerifyPage />} />
      </Route>

      <Route element={<PublicLayout />}>
        <Route index element={<Home />} />
        <Route path="/books" element={<ComingSoon title="Browse books" phase="F1" />} />
        <Route path="/books/:bookId" element={<ComingSoon title="Book details" phase="F1" />} />
        <Route path="/requests" element={<ComingSoon title="Book requests" phase="F4" />} />
        <Route path="/plans" element={<ComingSoon title="Reading plans" phase="F3" />} />
        <Route path="/privacy" element={<ComingSoon title="Privacy policy" phase="F6" />} />
        <Route path="/terms" element={<ComingSoon title="Terms" phase="F6" />} />
        <Route path="/contact" element={<ComingSoon title="Contact" phase="F6" />} />

        <Route element={<RequireAuth />}>
          <Route path="/account" element={<ComingSoon title="My library" phase="F3" />} />
          <Route path="/account/rentals" element={<ComingSoon title="My rentals" phase="F3" />} />
          <Route path="/account/payments" element={<ComingSoon title="My payments" phase="F3" />} />
          <Route path="/account/requests" element={<ComingSoon title="My requests" phase="F4" />} />
          <Route
            path="/account/notifications"
            element={<ComingSoon title="Notifications" phase="F4" />}
          />
          <Route
            path="/account/profile"
            element={
              <LegacyScreen>
                <Profile />
              </LegacyScreen>
            }
          />
        </Route>

        {import.meta.env.DEV ? <Route path="/dev/design" element={<DesignSystem />} /> : null}
        <Route path="*" element={<NotFound />} />
      </Route>

      {/* The reader is full-screen (no site header). */}
      <Route element={<RequireAuth />}>
        <Route path="/read/:bookId" element={<ComingSoon title="Reader" phase="F3" />} />
      </Route>

      <Route path="/admin" element={<RequireAuth role="admin" />}>
        <Route element={<AdminLayout />}>
          <Route index element={<ComingSoon inConsole title="Dashboard" phase="F5" />} />
          <Route path="payments" element={<ComingSoon inConsole title="Payments" phase="F5" />} />
          <Route path="rentals" element={<ComingSoon inConsole title="Rentals" phase="F5" />} />
          <Route path="books" element={<ComingSoon inConsole title="Books" phase="F5" />} />
          <Route
            path="requests"
            element={<ComingSoon inConsole title="Book requests" phase="F5" />}
          />
          <Route
            path="categories"
            element={<ComingSoon inConsole title="Categories" phase="F5" />}
          />
          <Route path="packages" element={<ComingSoon inConsole title="Packages" phase="F5" />} />
          <Route path="users" element={<ComingSoon inConsole title="Users" phase="F5" />} />
          <Route path="logs" element={<ComingSoon inConsole title="Activity logs" phase="F5" />} />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Route>
      </Route>
    </Routes>
  </Suspense>
);

export default AppRoutes;
