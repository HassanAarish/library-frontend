import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { LuBookPlus, LuSearch, LuX } from "react-icons/lu";
import { useI18n } from "@/i18n";
import { useCatalog, useCategories, useDebouncedValue } from "@/hooks/useBooks";
import { useSeo } from "@/hooks/useSeo";
import { BookGrid } from "@/components/books/BookCard";
import {
  Button,
  Container,
  EmptyState,
  ErrorState,
  Input,
  PageHeader,
  Pagination,
  Select,
} from "@/ui";

const SORTS = [
  ["newest", "catalog.sortNewest"],
  ["title", "catalog.sortTitle"],
  ["price_asc", "catalog.sortPriceAsc"],
  ["price_desc", "catalog.sortPriceDesc"],
  ["oldest", "catalog.sortOldest"],
];

// Book languages the catalogue offers today.
const LANGUAGES = ["English", "Urdu"];

const PAGE_SIZE = 20;

/**
 * The catalogue. Every filter lives in the URL (?search=&category=&language=
 * &sort=&page=), so results can be shared, bookmarked and survive Back.
 */
const Catalog = () => {
  const { t } = useI18n();
  useSeo({ title: t("catalog.title"), description: t("catalog.description") });
  const [params, setParams] = useSearchParams();

  const search = params.get("search") ?? "";
  const category = params.get("category") ?? "";
  const language = params.get("language") ?? "";
  const sort = params.get("sort") ?? "newest";
  const page = Math.max(Number(params.get("page")) || 1, 1);

  // Typing updates the box at once and the URL (and the query) after a pause.
  const [draft, setDraft] = useState(search);
  const debounced = useDebouncedValue(draft);

  const update = (changes) => {
    const next = new URLSearchParams(params);
    Object.entries(changes).forEach(([key, value]) => {
      if (value === "" || value == null) next.delete(key);
      else next.set(key, String(value));
    });
    // Any filter change starts again at page 1.
    if (!("page" in changes)) next.delete("page");
    if (next.get("sort") === "newest") next.delete("sort");
    setParams(next, { replace: !("page" in changes) });
  };

  useEffect(() => {
    if (debounced.trim() !== search) update({ search: debounced.trim() });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only when the typed text settles
  }, [debounced]);

  // Back/forward or a link changed ?search: show it in the box.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setDraft(search), [search]);

  const query = { search, category, language, sort, page, limit: PAGE_SIZE };
  const { data, isLoading, isError, error, refetch, isPlaceholderData } = useCatalog(query);
  const { data: categories = [] } = useCategories();

  const filtered = Boolean(search || category || language);
  const results = data?.results ?? [];

  const goToPage = (next) => {
    update({ page: next > 1 ? next : "" });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <Container size="xl" className="py-10 sm:py-14">
      <PageHeader
        eyebrow={t("catalog.eyebrow")}
        title={t("catalog.title")}
        description={t("catalog.description")}
      />

      <div
        role="search"
        className="mb-8 grid gap-3 rounded-card border border-line bg-surface p-3 shadow-card sm:grid-cols-2 lg:grid-cols-[1fr_13rem_11rem_13rem]"
      >
        <div className="sm:col-span-2 lg:col-span-1">
          <label htmlFor="catalog-search" className="sr-only">
            {t("catalog.searchLabel")}
          </label>
          <Input
            id="catalog-search"
            type="search"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={t("catalog.searchPlaceholder")}
            startIcon={<LuSearch />}
          />
        </div>
        <Select
          aria-label={t("catalog.category")}
          value={category}
          onChange={(e) => update({ category: e.target.value })}
        >
          <option value="">{t("catalog.allCategories")}</option>
          {categories.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
        </Select>
        <Select
          aria-label={t("catalog.language")}
          value={language}
          onChange={(e) => update({ language: e.target.value })}
        >
          <option value="">{t("catalog.allLanguages")}</option>
          {LANGUAGES.map((l) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
        </Select>
        <Select
          aria-label={t("catalog.sort")}
          value={sort}
          onChange={(e) => update({ sort: e.target.value })}
        >
          {SORTS.map(([value, key]) => (
            <option key={value} value={value}>
              {t(key)}
            </option>
          ))}
        </Select>
      </div>

      {data ? (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          {/* The result count heads the grid (book cards are h3). */}
          <h2 className="font-sans text-sm font-normal text-fg-muted" aria-live="polite">
            <span className="font-semibold text-fg">
              {t("catalog.results", { count: data.totalDocs })}
            </span>{" "}
            {search ? t("catalog.resultsFor", { query: search }) : null}
          </h2>
          {filtered ? (
            <Button
              variant="ghost"
              size="sm"
              icon={<LuX />}
              onClick={() => {
                setDraft("");
                setParams(sort !== "newest" ? { sort } : {}, { replace: true });
              }}
            >
              {t("catalog.clearFilters")}
            </Button>
          ) : null}
        </div>
      ) : null}

      {isError ? (
        <ErrorState error={error} onRetry={refetch} />
      ) : !isLoading && results.length === 0 ? (
        <EmptyState
          icon={<LuBookPlus />}
          title={filtered ? t("catalog.emptyTitle") : t("catalog.emptyLibraryTitle")}
          description={filtered ? t("catalog.emptyBody") : t("catalog.emptyLibraryBody")}
          action={
            <Button variant="secondary" to="/requests">
              {t("catalog.requestCta")}
            </Button>
          }
        />
      ) : (
        <div className={isPlaceholderData ? "opacity-60 transition-opacity" : undefined}>
          <BookGrid books={results} loading={isLoading} />
          <Pagination page={page} totalPages={data?.totalPages} onChange={goToPage} />
        </div>
      )}
    </Container>
  );
};

export default Catalog;
