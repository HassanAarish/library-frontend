import { BrowserRouter } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { QueryClientProvider } from "@tanstack/react-query";
import { Slide, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { queryClient } from "@/lib/queryClient";
import { I18nProvider, useI18n } from "@/i18n";
import { ThemeProvider, useTheme } from "@/context/ThemeContext";
import { AuthProvider } from "@/context/AuthContext";
import { ModalProvider } from "@/context/ModalContext";
import { SocketProvider } from "@/realtime/SocketProvider";
import ErrorBoundary from "@/pages/system/ErrorBoundary";
import AppRoutes from "@/routes/AppRoutes";
import { GOOGLE_CLIENT_ID } from "@/constants";

const Toasts = () => {
  const { dir } = useI18n();
  const { resolvedTheme } = useTheme();
  return (
    <ToastContainer
      position={dir === "rtl" ? "bottom-left" : "bottom-right"}
      rtl={dir === "rtl"}
      theme={resolvedTheme}
      autoClose={4000}
      hideProgressBar
      newestOnTop
      closeOnClick
      pauseOnHover
      transition={Slide}
    />
  );
};

/**
 * Provider order matters: i18n + theme first (the error page uses them),
 * then data (React Query) → session (Auth) → live updates (Socket).
 */
const App = () => (
  <I18nProvider>
    <ThemeProvider>
      <ErrorBoundary>
        <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID || ""}>
          <QueryClientProvider client={queryClient}>
            <BrowserRouter>
              <AuthProvider>
                <SocketProvider>
                  <ModalProvider>
                    <AppRoutes />
                    <Toasts />
                  </ModalProvider>
                </SocketProvider>
              </AuthProvider>
            </BrowserRouter>
          </QueryClientProvider>
        </GoogleOAuthProvider>
      </ErrorBoundary>
    </ThemeProvider>
  </I18nProvider>
);

export default App;
