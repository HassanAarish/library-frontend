import { Link } from "react-router-dom";
import { LuShieldAlert } from "react-icons/lu";
import { useI18n } from "@/i18n";
import { useSeo } from "@/hooks/useSeo";
import { usePageContent } from "@/content/legal";
import { Container } from "@/ui";

const Block = ({ block }) => {
  if (typeof block === "string") return <p>{block}</p>;
  if (block.list) {
    return (
      <ul className="list-disc space-y-2 ps-5 marker:text-fg-subtle">
        {block.list.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    );
  }
  if (block.notice) {
    return (
      <div
        role="note"
        className="flex gap-3 rounded-lg border border-danger/30 bg-danger-soft p-4 font-medium text-fg"
      >
        <LuShieldAlert aria-hidden className="mt-0.5 size-5 shrink-0 text-danger" />
        <p>{block.notice}</p>
      </div>
    );
  }
  return null;
};

/** Privacy policy / terms: title, date, "On this page" contents and numbered sections. */
const LegalPage = ({ name }) => {
  const { t, date } = useI18n();
  const doc = usePageContent(name);
  useSeo({ title: doc.title, description: doc.description });

  return (
    <Container size="lg" className="py-12 sm:py-16">
      <header className="max-w-3xl">
        <p className="mb-1 text-xs font-semibold tracking-[0.14em] text-gold uppercase">
          {t("legal.eyebrow")}
        </p>
        <h1 className="text-3xl font-semibold sm:text-4xl">{doc.title}</h1>
        <p className="mt-2 text-sm text-fg-subtle">
          {t("legal.updated", { date: date(doc.updated, { dateStyle: "long" }) })}
        </p>
        <p className="mt-6 text-lg text-fg-muted">{doc.intro}</p>
      </header>

      <div className="mt-10 grid gap-10 lg:grid-cols-[14rem_1fr]">
        <nav aria-labelledby="legal-toc" className="lg:sticky lg:top-24 lg:self-start">
          <h2 id="legal-toc" className="mb-3 text-sm font-semibold">
            {t("legal.onThisPage")}
          </h2>
          <ol className="space-y-1.5 text-sm">
            {doc.sections.map((s, i) => (
              <li key={s.id}>
                <a href={`#${s.id}`} className="text-fg-muted hover:text-fg hover:underline">
                  {i + 1}. {s.heading}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <div className="min-w-0 max-w-3xl space-y-10">
          {doc.sections.map((s, i) => (
            <section key={s.id} id={s.id} aria-labelledby={`${s.id}-h`} className="scroll-mt-24">
              <h2 id={`${s.id}-h`} className="text-xl font-semibold sm:text-2xl">
                {i + 1}. {s.heading}
              </h2>
              <div className="mt-3 space-y-4 leading-relaxed text-fg-muted">
                {s.body.map((block, j) => (
                  <Block key={j} block={block} />
                ))}
              </div>
            </section>
          ))}

          <p className="border-t border-line pt-6 text-sm text-fg-subtle">
            {t("legal.questions")}{" "}
            <Link to="/contact" className="text-brand underline underline-offset-2">
              {t("legal.contactUs")}
            </Link>
          </p>
        </div>
      </div>
    </Container>
  );
};

export default LegalPage;
