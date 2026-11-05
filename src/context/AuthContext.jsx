import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { user as userApi } from "@/lib/api";
import { getToken, setUnauthorizedHandler } from "@/lib/http";
import { TOKEN_KEY } from "@/constants";

/**
 * Who is signed in. The token lives in localStorage; on start-up the profile
 * is loaded from the backend, which is the source of truth for the role (the
 * backend never trusts the role inside the token either).
 *
 * status: "loading" (checking a saved token) | "guest" | "authenticated"
 */
const AuthContext = createContext(null);

const storeToken = (token) => {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    // private mode: the session lasts until the tab closes
  }
};

export const AuthProvider = ({ children }) => {
  const queryClient = useQueryClient();
  const [state, setState] = useState(() => ({
    status: getToken() ? "loading" : "guest",
    user: null,
    preferences: null,
    token: getToken(),
  }));

  const signOut = useCallback(() => {
    storeToken(null);
    // Drop every cached response that belonged to this user.
    queryClient.clear();
    setState({ status: "guest", user: null, preferences: null, token: null });
  }, [queryClient]);

  const loadProfile = useCallback(async (token) => {
    try {
      const { user, preferences } = await userApi.profile();
      setState({ status: "authenticated", user, preferences, token });
      return user;
    } catch {
      storeToken(null);
      setState({ status: "guest", user: null, preferences: null, token: null });
      return null;
    }
  }, []);

  /** Call with the token from login / social login / 2FA. Resolves to the user. */
  const signIn = useCallback(
    (token) => {
      storeToken(token);
      setState((prev) => ({ ...prev, status: "loading", token }));
      return loadProfile(token);
    },
    [loadProfile],
  );

  /** Re-pull user + preferences after a profile edit, without a loading flash. */
  const refreshProfile = useCallback(async () => {
    try {
      const { user, preferences } = await userApi.profile();
      setState((prev) => ({ ...prev, user, preferences }));
    } catch {
      // keep the current data; a 401 signs out via the handler below
    }
  }, []);

  useEffect(() => {
    const token = getToken();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time session restore
    if (token) loadProfile(token);
  }, [loadProfile]);

  // Any 401 from the API (expired token, password changed elsewhere, blocked
  // mid-session) ends the session.
  useEffect(() => {
    setUnauthorizedHandler(signOut);
    return () => setUnauthorizedHandler(() => {});
  }, [signOut]);

  const value = useMemo(
    () => ({
      ...state,
      isAuthenticated: state.status === "authenticated",
      isAdmin: state.user?.role === "admin",
      signIn,
      signOut,
      refreshProfile,
    }),
    [state, signIn, signOut, refreshProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
};
