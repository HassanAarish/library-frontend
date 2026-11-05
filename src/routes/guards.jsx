import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import FullPageLoader from "@/pages/system/FullPageLoader";

/**
 * Route gates. The backend enforces every rule itself; these only keep people
 * on screens they can use.
 *
 *   <Route element={<RequireAuth />}>…signed-in pages…</Route>
 *   <Route element={<RequireAuth role="admin" />}>…admin console…</Route>
 *   <Route element={<GuestOnly />}>…sign in / sign up…</Route>
 */
// eslint-disable-next-line react-refresh/only-export-components
export const homeFor = (user) => (user?.role === "admin" ? "/admin" : "/account");

export const RequireAuth = ({ role }) => {
  const { status, user } = useAuth();
  const location = useLocation();

  if (status === "loading") return <FullPageLoader />;
  if (status !== "authenticated") {
    // Come back here after signing in.
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  if (role && user?.role !== role) return <Navigate to={homeFor(user)} replace />;
  return <Outlet />;
};

export const GuestOnly = () => {
  const { status, user } = useAuth();
  const location = useLocation();

  if (status === "loading") return <FullPageLoader />;
  if (status === "authenticated") {
    const from = location.state?.from?.pathname;
    return <Navigate to={from && from !== "/login" ? from : homeFor(user)} replace />;
  }
  return <Outlet />;
};
