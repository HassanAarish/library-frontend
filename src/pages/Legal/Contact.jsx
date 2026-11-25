import { Link } from "react-router-dom";
import { LuChevronDown, LuMail, LuMessageCircle } from "react-icons/lu";
import { useI18n } from "@/i18n";
import { useSeo } from "@/hooks/useSeo";
import { usePageContent } from "@/content/legal";
import { site } from "@/lib/site";
import { Alert, Card, Container, PageHeader } from "@/ui";

const Channel = ({ icon, title, hint, href, value }) => (
  <Card className="flex gap-4 p-5">
    <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-xl text-brand">
      {icon}
    </span>
    <div className="min-w-0">
      <h2 className="font-semibold">{title}</h2>
      <a
        href={href}
        className="mt-0.5 block font-medium break-all text-brand underline-offset-2 hover:underline"
        {...(href.startsWith("http") && { target: "_blank", rel: "noreferrer" })}
      >
        {value}
      </a>
      <p className="mt-1 text-sm text-fg-muted">{hint}</p>
    </div>
  </Card>
);

/** /contact: support email (and WhatsApp when configured), payment tip, common questions. */
const Contact = () => {
  const { t } = useI18n();
  const c = usePageContent("contact");
  useSeo({ title: c.title, description: c.description });

  return (
    <Container size="md" className="py-12 sm:py-16">
      <PageHeader eyebrow={t("legal.help")} title={c.title} description={c.intro} />

      <div className="grid gap-4 sm:grid-cols-2">
        <Channel
          icon={<LuMail aria-hidden />}
          title={c.email}
          hint={c.emailHint}
          href={`mailto:${site.supportEmail}`}
          value={site.supportEmail}
        />
        {site.whatsapp ? (
          <Channel
            icon={<LuMessageCircle aria-hidden />}
            title={c.whatsapp}
            hint={c.whatsappHint}
            href={`https://wa.me/${site.whatsapp}`}
            value={`+${site.whatsapp}`}
          />
        ) : null}
      </div>

      <Alert tone="info" title={c.tipTitle} className="mt-6">
        {c.tip}
      </Alert>

      <section aria-labelledby="faq" className="mt-12">
        <h2 id="faq" className="text-2xl font-semibold">
          {c.faqTitle}
        </h2>
        <div className="mt-4 divide-y divide-line rounded-card border border-line bg-surface">
          {c.faq.map((item) => (
            <details key={item.q} className="group px-5 py-4">
              <summary className="flex cursor-pointer list-none items-start justify-between gap-4 font-medium marker:hidden group-open:text-brand">
                {item.q}
                <LuChevronDown
                  aria-hidden
                  className="mt-1 shrink-0 text-fg-subtle transition-transform group-open:rotate-180"
                />
              </summary>
              <p className="mt-2 text-fg-muted">{item.a}</p>
            </details>
          ))}
        </div>
        <p className="mt-6 text-sm text-fg-subtle">
          <Link to="/terms" className="hover:text-fg hover:underline">
            {t("footer.terms")}
          </Link>
          {" · "}
          <Link to="/privacy" className="hover:text-fg hover:underline">
            {t("footer.privacy")}
          </Link>
        </p>
      </section>
    </Container>
  );
};

export default Contact;
