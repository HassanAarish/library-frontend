import { Link } from "react-router-dom";
import { useI18n } from "@/i18n";
import { Container } from "@/ui";
import Logo from "./Logo";

const SiteFooter = () => {
  const { t } = useI18n();
  return (
    <footer className="mt-24 border-t border-line bg-sunken/40">
      <Container
        size="xl"
        className="flex flex-col gap-8 py-12 sm:flex-row sm:items-start sm:justify-between"
      >
        <div className="max-w-xs">
          <Logo />
          <p className="mt-3 text-sm text-fg-muted">{t("footer.about")}</p>
        </div>
        <nav aria-label="Footer" className="grid grid-cols-2 gap-x-12 gap-y-2 text-sm">
          <Link to="/books" className="text-fg-muted hover:text-fg">
            {t("nav.browse")}
          </Link>
          <Link to="/privacy" className="text-fg-muted hover:text-fg">
            {t("footer.privacy")}
          </Link>
          <Link to="/requests" className="text-fg-muted hover:text-fg">
            {t("nav.requests")}
          </Link>
          <Link to="/terms" className="text-fg-muted hover:text-fg">
            {t("footer.terms")}
          </Link>
          <Link to="/plans" className="text-fg-muted hover:text-fg">
            {t("nav.plans")}
          </Link>
          <Link to="/contact" className="text-fg-muted hover:text-fg">
            {t("footer.contact")}
          </Link>
        </nav>
      </Container>
      <Container size="xl" className="border-t border-line py-5 text-xs text-fg-subtle">
        {t("footer.rights", { year: new Date().getFullYear() })}
      </Container>
    </footer>
  );
};

export default SiteFooter;
