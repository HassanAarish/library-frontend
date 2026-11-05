import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LuBookOpenCheck, LuCalendarCheck, LuSearch, LuWallet } from "react-icons/lu";
import { useI18n } from "@/i18n";
import { BookCover, Button, Container, Input } from "@/ui";
import { BookGrid } from "@/components/books/BookCard";
import { useCatalog, useDocumentTitle } from "@/hooks/useBooks";

// Decorative stack for the hero (typeset covers, no real data needed).
const SHOWCASE = [
  { title: "The Alchemist", author: "Paulo Coelho" },
  { title: "Raja Gidh", author: "Bano Qudsia" },
  { title: "Atomic Habits", author: "James Clear" },
];

const STEPS = [
  { icon: LuSearch, title: "home.step1Title", body: "home.step1Body" },
  { icon: LuWallet, title: "home.step2Title", body: "home.step2Body" },
  { icon: LuBookOpenCheck, title: "home.step3Title", body: "home.step3Body" },
];

/** The latest books, straight from the catalogue (hidden until there are some). */
const NewArrivals = ({ t }) => {
  const { data, isLoading } = useCatalog(NEW_ARRIVALS);
  const books = data?.results ?? [];
  if (!isLoading && books.length === 0) return null;

  return (
    <section className="border-b border-line">
      <Container size="xl" className="py-16">
        <div className="mb-8 flex items-end justify-between gap-4">
          <h2 className="text-3xl font-semibold">{t("home.newArrivals")}</h2>
          <Button variant="link" to="/books">
            {t("home.seeAll")} →
          </Button>
        </div>
        <BookGrid books={books} loading={isLoading} skeletons={5} />
      </Container>
    </section>
  );
};

const NEW_ARRIVALS = { sort: "newest", limit: 10 };

const Home = () => {
  useDocumentTitle();
  const { t } = useI18n();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  const search = (e) => {
    e.preventDefault();
    const q = query.trim();
    navigate(q ? `/books?search=${encodeURIComponent(q)}` : "/books");
  };

  return (
    <>
      <section className="overflow-hidden border-b border-line bg-linear-to-b from-gold-soft/60 to-canvas">
        <Container
          size="xl"
          className="grid items-center gap-12 py-16 md:grid-cols-[1.15fr_1fr] md:py-24"
        >
          <div>
            <p className="text-xs font-semibold tracking-[0.16em] text-gold uppercase">
              {t("home.eyebrow")}
            </p>
            <h1 className="mt-4 text-4xl leading-[1.08] font-semibold text-balance sm:text-5xl lg:text-6xl">
              {t("home.title")}
            </h1>
            <p className="mt-5 max-w-xl text-lg text-fg-muted">{t("home.subtitle")}</p>

            <form
              onSubmit={search}
              role="search"
              className="mt-8 flex max-w-xl flex-col gap-3 sm:flex-row"
            >
              <label htmlFor="home-search" className="sr-only">
                {t("common.search")}
              </label>
              <div className="flex-1">
                <Input
                  id="home-search"
                  size="lg"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={t("home.searchPlaceholder")}
                  startIcon={<LuSearch />}
                  className="bg-surface"
                />
              </div>
              <Button type="submit" size="lg">
                {t("common.search")}
              </Button>
            </form>
            <Button variant="link" to="/books" className="mt-4">
              {t("home.browse")} →
            </Button>
          </div>

          <div className="relative mx-auto hidden h-80 w-full max-w-sm md:block" aria-hidden>
            {SHOWCASE.map((book, i) => (
              <div
                key={book.title}
                className="absolute top-1/2 inset-s-1/2 transition-transform"
                style={{
                  transform: `translate(calc(-50% + ${(i - 1) * 7}rem), -50%) rotate(${(i - 1) * 6}deg)`,
                  zIndex: i === 1 ? 2 : 1,
                }}
              >
                <BookCover
                  title={book.title}
                  author={book.author}
                  size={i === 1 ? "xl" : "lg"}
                  plain={i !== 1}
                />
              </div>
            ))}
          </div>
        </Container>
      </section>

      <NewArrivals t={t} />

      <section>
        <Container size="xl" className="py-16 md:py-20">
          <h2 className="text-3xl font-semibold">{t("home.howTitle")}</h2>
          <ol className="mt-10 grid gap-8 md:grid-cols-3">
            {STEPS.map(({ icon: Icon, title, body }, i) => (
              <li key={title} className="relative">
                <span className="flex size-11 items-center justify-center rounded-xl bg-brand-soft text-xl text-brand">
                  <Icon aria-hidden />
                </span>
                <p className="mt-4 text-xs font-semibold text-fg-subtle">0{i + 1}</p>
                <h3 className="mt-1 text-xl font-semibold">{t(title)}</h3>
                <p className="mt-2 text-fg-muted">{t(body)}</p>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      <section>
        <Container size="xl">
          <div className="flex flex-col items-start gap-5 rounded-card border border-line bg-surface p-8 shadow-card sm:flex-row sm:items-center sm:justify-between md:p-10">
            <div className="flex items-start gap-4">
              <LuCalendarCheck
                className="mt-1 hidden shrink-0 text-2xl text-gold sm:block"
                aria-hidden
              />
              <div>
                <h2 className="text-2xl font-semibold">{t("home.requestTitle")}</h2>
                <p className="mt-2 max-w-xl text-fg-muted">{t("home.requestBody")}</p>
              </div>
            </div>
            <Button variant="secondary" to="/requests">
              {t("home.requestCta")}
            </Button>
          </div>
        </Container>
      </section>
    </>
  );
};

export default Home;
