import { useState } from "react";
import { LuBookPlus, LuTags } from "react-icons/lu";
import { useI18n } from "@/i18n";
import { useMyBookRequests, useMyCategorySuggestions } from "@/hooks/useCommunity";
import AccountPage from "@/components/account/AccountPage";
import RequestCard from "@/components/requests/RequestCard";
import { Badge, Button, Card, EmptyState, ErrorState, Pagination, Skeleton } from "@/ui";

const SUGGESTION_TONE = { pending: "warning", approved: "success", rejected: "danger" };

/** /account/requests: book requests I asked for or follow + my category suggestions. */
const MyRequests = () => {
  const { t, date } = useI18n();
  const [page, setPage] = useState(1);
  const requests = useMyBookRequests({ page, limit: 12 });
  const suggestions = useMyCategorySuggestions();
  const list = (requests.data?.results ?? []).map((r) => ({ ...r, following: true }));

  return (
    <AccountPage
      title={t("requests.mineTitle")}
      description={t("requests.mineDescription")}
      actions={
        <Button to="/requests?new=1" icon={<LuBookPlus aria-hidden />}>
          {t("requests.newRequest")}
        </Button>
      }
    >
      {requests.isError ? (
        <ErrorState error={requests.error} onRetry={requests.refetch} />
      ) : requests.isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-44 w-full" rounded="rounded-card" />
          ))}
        </div>
      ) : list.length === 0 ? (
        <EmptyState
          icon={<LuBookPlus />}
          title={t("requests.mineEmpty")}
          action={<Button to="/requests?new=1">{t("requests.newRequest")}</Button>}
        />
      ) : (
        <>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((r) => (
              <li key={r._id}>
                <RequestCard request={r} />
              </li>
            ))}
          </ul>
          <Pagination page={page} totalPages={requests.data?.totalPages} onChange={setPage} />
        </>
      )}

      {suggestions.data?.length ? (
        <section className="mt-12">
          <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold">
            <LuTags className="text-gold" aria-hidden /> {t("requests.mySuggestions")}
          </h2>
          <ul className="grid gap-3 sm:grid-cols-2">
            {suggestions.data.map((c) => (
              <li key={c._id}>
                <Card padded={false} className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-medium">{c.name}</p>
                    <Badge tone={SUGGESTION_TONE[c.status]} dot>
                      {t(`requests.suggestionStatus.${c.status}`)}
                    </Badge>
                  </div>
                  <p className="mt-1 text-xs text-fg-subtle">{date(c.createdAt)}</p>
                  {c.reviewNote ? (
                    <p className="mt-2 text-sm text-fg-muted">{c.reviewNote}</p>
                  ) : null}
                </Card>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </AccountPage>
  );
};

export default MyRequests;
