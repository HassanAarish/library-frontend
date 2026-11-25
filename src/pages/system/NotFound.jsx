import { useI18n } from "@/i18n";
import { Button, Container } from "@/ui";

const NotFound = () => {
  const { t } = useI18n();
  return (
    <Container size="sm" className="py-24 text-center">
      <p aria-hidden className="font-serif text-7xl font-semibold text-fg-subtle">
        404
      </p>
      <h1 className="mt-4 text-3xl font-semibold">{t("errors.notFoundTitle")}</h1>
      <p className="mt-3 text-fg-muted">{t("errors.notFoundBody")}</p>
      <Button to="/" className="mt-8">
        {t("errors.goHome")}
      </Button>
    </Container>
  );
};

export default NotFound;
