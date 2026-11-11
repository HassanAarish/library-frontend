import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { sessionFlags } from "@/lib/sessionFlags";
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
    // Just deleted their account here: go home, not to sign-in.
    if (sessionFlags.closingAccount) return <Navigate to="/" replace />;
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
    // Back to where sign-in was asked for, including its ?query (e.g. ?new=1).
    const from = location.state?.from;
    const back =
      from?.pathname && from.pathname !== "/login" ? from.pathname + (from.search ?? "") : null;
    return <Navigate to={back ?? homeFor(user)} replace />;
  }
  return <Outlet />;
};
