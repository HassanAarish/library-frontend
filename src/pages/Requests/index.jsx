import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { LuBookPlus, LuPlus, LuSearch } from "react-icons/lu";
import { useAuth } from "@/context/AuthContext";
import { useI18n } from "@/i18n";
import { useDebouncedValue } from "@/hooks/useBooks";
import { useSeo } from "@/hooks/useSeo";
import { useBookRequests } from "@/hooks/useCommunity";
import RequestCard from "@/components/requests/RequestCard";
import RequestForm, { CategorySuggest } from "@/components/requests/RequestForm";
import {
  Button,
  Container,
  EmptyState,
  ErrorState,
  Input,
  PageHeader,
  Pagination,
  Select,
  Skeleton,
} from "@/ui";

/** /requests: the most-wanted books, a request form, and category suggestions. */
const Requests = () => {
  const { t } = useI18n();
  const { isAuthenticated } = useAuth();
  useSeo({ title: t("requests.eyebrow"), description: t("requests.description") });
  const [params, setParams] = useSearchParams();
  const [formOpen, setFormOpen] = useState(params.get("new") === "1");

  const search = params.get("search") ?? "";
  const status = params.get("status") ?? "";
  const sort = params.get("sort") ?? "popular";
  const page = Math.max(Number(params.get("page")) || 1, 1);

  const [draft, setDraft] = useState(search);
  const debounced = useDebouncedValue(draft);

  const update = (changes) => {
    const next = new URLSearchParams(params);
    Object.entries(changes).forEach(([k, v]) => (v ? next.set(k, String(v)) : next.delete(k)));
    if (!("page" in changes)) next.delete("page");
    next.delete("new");
    setParams(next, { replace: !("page" in changes) });
  };

  useEffect(() => {
    if (debounced.trim() !== search) update({ search: debounced.trim() });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only when typing settles
  }, [debounced]);

  const { data, isLoading, isError, error, refetch } = useBookRequests({
    search,
    status,
    sort,
    page,
    limit: 18,
  });
  const list = data?.results ?? [];

  // Visitors are sent to sign in first, then come back with the form open.
  const requestButton = isAuthenticated ? (
    <Button icon={<LuPlus aria-hidden />} onClick={() => setFormOpen(true)}>
      {t("requests.newRequest")}
    </Button>
  ) : (
    <Button
      icon={<LuPlus aria-hidden />}
      to="/login"
      state={{ from: { pathname: "/requests", search: "?new=1" } }}
    >
      {t("requests.signInToRequest")}
    </Button>
  );

  return (
    <Container size="xl" className="py-10 sm:py-14">
      <PageHeader
        eyebrow={t("requests.eyebrow")}
        title={t("requests.title")}
        description={t("requests.description")}
        actions={requestButton}
      />

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="min-w-0">
          <div
            role="search"
            className="mb-6 grid gap-3 rounded-card border border-line bg-surface p-3 shadow-card sm:grid-cols-[1fr_12rem_11rem]"
          >
            <div>
              <label htmlFor="requests-search" className="sr-only">
                {t("requests.searchLabel")}
              </label>
              <Input
                id="requests-search"
                type="search"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder={t("requests.searchPlaceholder")}
                startIcon={<LuSearch />}
              />
            </div>
            <Select
              aria-label={t("requests.statusFilter")}
              value={status}
              onChange={(e) => update({ status: e.target.value })}
            >
              <option value="">{t("requests.allOpen")}</option>
              <option value="reviewing">{t("requests.status.reviewing")}</option>
              <option value="planned">{t("requests.status.planned")}</option>
              <option value="fulfilled">{t("requests.fulfilledFilter")}</option>
            </Select>
            <Select
              aria-label={t("requests.sort")}
              value={sort}
              onChange={(e) => update({ sort: e.target.value === "popular" ? "" : e.target.value })}
            >
              <option value="popular">{t("requests.sortPopular")}</option>
              <option value="newest">{t("requests.sortNewest")}</option>
            </Select>
          </div>

          {isError ? (
            <ErrorState error={error} onRetry={refetch} />
          ) : isLoading ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {[0, 1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-44 w-full" rounded="rounded-card" />
              ))}
            </div>
          ) : list.length === 0 ? (
            <EmptyState
              icon={<LuBookPlus />}
              title={search || status ? t("requests.empty") : t("requests.emptyAll")}
              action={requestButton}
            />
          ) : (
            <>
              <ul className="grid gap-4 sm:grid-cols-2">
                {list.map((r) => (
                  <li key={r._id}>
                    <RequestCard request={r} />
                  </li>
                ))}
              </ul>
              <Pagination
                page={page}
                totalPages={data?.totalPages}
                onChange={(p) => update({ page: p > 1 ? p : "" })}
              />
            </>
          )}
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <CategorySuggest />
        </aside>
      </div>

      <RequestForm open={formOpen} onClose={() => setFormOpen(false)} />
    </Container>
  );
};

export default Requests;
