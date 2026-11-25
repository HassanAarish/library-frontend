import { Component } from "react";
import { useI18n } from "@/i18n";
import { Button } from "@/ui";

const Fallback = () => {
  const { t } = useI18n();
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
      <p className="text-xs font-semibold tracking-[0.14em] text-gold uppercase">LibraryHub</p>
      <h1 className="mt-2 text-3xl font-semibold">{t("errors.title")}</h1>
      <p className="mt-3 max-w-md text-fg-muted">{t("errors.body")}</p>
      <Button className="mt-6" onClick={() => window.location.reload()}>
        {t("errors.reload")}
      </Button>
    </div>
  );
};

/** Last line of defence: a render crash shows a friendly page, not a blank screen. */
class ErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error("UI crashed:", error, info?.componentStack);
  }

  render() {
    return this.state.error ? <Fallback /> : this.props.children;
  }
}

export default ErrorBoundary;
