import { Outlet } from "react-router-dom";
import { useI18n } from "@/i18n";
import SiteHeader from "@/components/shell/SiteHeader";
import SiteFooter from "@/components/shell/SiteFooter";
import OfflineBanner from "@/components/shell/OfflineBanner";
import ScrollToTop from "@/routes/ScrollToTop";

/** Header + page + footer, for the public site and the reader's account pages. */
const PublicLayout = () => {
  const { t } = useI18n();
  return (
    <div className="flex min-h-dvh flex-col">
      <a
        href="#main"
        className="sr-only z-50 rounded-lg bg-brand px-4 py-2 text-on-brand focus:not-sr-only focus:fixed focus:inset-s-4 focus:top-4"
      >
        {t("nav.skipToContent")}
      </a>
      <ScrollToTop />
      <OfflineBanner />
      <SiteHeader />
      <main id="main" className="flex-1">
        <Outlet />
      </main>
      <SiteFooter />
    </div>
  );
};

export default PublicLayout;
