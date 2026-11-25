import { LuGlobe, LuSmartphone } from "react-icons/lu";
import { useI18n } from "@/i18n";
import { useSeo } from "@/hooks/useSeo";
import { usePageContent } from "@/content/legal";
import { Alert, Button, Card, Container, PageHeader } from "@/ui";

const Steps = ({ icon, title, steps, children }) => (
  <Card className="p-5">
    <div className="flex items-center gap-3">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-lg text-brand">
        {icon}
      </span>
      <h3 className="font-semibold">{title}</h3>
    </div>
    <ol className="mt-4 list-decimal space-y-1.5 ps-5 text-sm text-fg-muted">
      {steps.map((s) => (
        <li key={s}>{s}</li>
      ))}
    </ol>
    {children}
  </Card>
);

const List = ({ title, items }) => (
  <section>
    <h2 className="text-xl font-semibold">{title}</h2>
    <ul className="mt-3 list-disc space-y-1.5 ps-5 text-fg-muted">
      {items.map((i) => (
        <li key={i}>{i}</li>
      ))}
    </ul>
  </section>
);

/**
 * /delete-account: how to delete an account, in the app or on the website,
 * and what's deleted and kept. Public, because Google Play asks for a link
 * people can use without the app.
 */
const DeleteAccount = () => {
  const { t } = useI18n();
  const c = usePageContent("deleteAccount");
  useSeo({ title: c.title, description: c.description });

  return (
    <Container size="md" className="py-12 sm:py-16">
      <PageHeader eyebrow={t("legal.help")} title={c.title} description={c.intro} />

      <h2 className="text-xl font-semibold">{c.howTitle}</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Steps icon={<LuSmartphone aria-hidden />} title={c.inApp.title} steps={c.inApp.steps} />
        <Steps icon={<LuGlobe aria-hidden />} title={c.onWeb.title} steps={c.onWeb.steps}>
          <Button to="/account/profile" variant="secondary" size="sm" className="mt-4">
            {c.openProfile}
          </Button>
        </Steps>
      </div>
      <Alert tone="info" className="mt-4">
        {c.byEmail}
      </Alert>

      <div className="mt-10 space-y-8">
        <List title={c.beforeTitle} items={c.before} />
        <List title={c.deletedTitle} items={c.deleted} />
        <List title={c.keptTitle} items={c.kept} />
        <section>
          <h2 className="text-xl font-semibold">{c.changeTitle}</h2>
          <p className="mt-3 text-fg-muted">{c.change}</p>
        </section>
      </div>
    </Container>
  );
};

export default DeleteAccount;
