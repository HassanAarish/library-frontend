import { Link, useParams } from "react-router-dom";
import { LuArrowLeft, LuBookCheck, LuUsers } from "react-icons/lu";
import { useI18n } from "@/i18n";
import { useDocumentTitle } from "@/hooks/useBooks";
import { useBookRequest } from "@/hooks/useCommunity";
import { FollowButton, RequestStatus } from "@/components/requests/RequestCard";
import { BookCover, Button, Card, Container, EmptyState, ErrorState, Skeleton } from "@/ui";

/** /requests/:id: one request with its status timeline. */
const RequestDetail = () => {
  const { requestId } = useParams();
  const { t, date } = useI18n();
  const { data: r, isLoading, isError, error, refetch } = useBookRequest(requestId);
  useDocumentTitle(r?.title ?? t("requests.eyebrow"));

  const back = (
    <Link
      to="/requests"
      className="mb-8 inline-flex items-center gap-2 text-sm text-fg-muted hover:text-fg"
    >
      <LuArrowLeft className="rtl:rotate-180" aria-hidden /> {t("requests.back")}
    </Link>
  );

  if (isLoading) {
    return (
      <Container size="md" className="py-10">
        {back}
        <Skeleton className="h-10 w-2/3" />
        <Skeleton className="mt-6 h-60 w-full" rounded="rounded-card" />
      </Container>
    );
  }
  if (isError) {
    return (
      <Container size="md" className="py-10">
        {back}
        {error?.status === 404 ? (
          <EmptyState title={t("requests.notFound")} />
        ) : (
          <ErrorState error={error} onRetry={refetch} />
        )}
      </Container>
    );
  }

  const history = [...(r.history ?? [])].reverse();

  return (
    <Container size="md" className="py-10 sm:py-14">
      {back}
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
        {r.book ? (
          <BookCover
            src={r.book.coverImage?.url}
            title={r.book.title}
            author={r.book.author}
            size="md"
          />
        ) : null}
        <div className="min-w-0 flex-1">
          <RequestStatus status={r.status} />
          <h1 className="mt-3 text-3xl font-semibold text-balance sm:text-4xl">{r.title}</h1>
          {r.author ? (
            <p className="mt-1 text-lg text-fg-muted">{t("book.by", { author: r.author })}</p>
          ) : null}
          <p className="mt-4 flex items-center gap-2 text-sm text-fg-subtle">
            <LuUsers aria-hidden /> {t("requests.wanted", { count: r.followerCount })}
            {r.language ? ` · ${r.language}` : null}
            {r.isbn ? ` · ISBN ${r.isbn}` : null}
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            {r.status === "fulfilled" && r.book ? (
              <Button icon={<LuBookCheck aria-hidden />} to={`/books/${r.book._id}`}>
                {t("requests.viewBook")}
              </Button>
            ) : (
              <FollowButton request={r} size="md" />
            )}
          </div>
        </div>
      </div>

      {r.statusNote ? (
        <Card className="mt-8 border-gold/40 bg-gold-soft/40">
          <p className="text-xs font-semibold tracking-wide text-gold uppercase">
            {t("requests.adminNote")}
          </p>
          <p className="mt-1 text-fg">{r.statusNote}</p>
        </Card>
      ) : null}

      <section className="mt-10">
        <h2 className="mb-4 text-xl font-semibold">{t("requests.timeline")}</h2>
        <ol className="relative space-y-6 border-s border-line ps-6">
          {history.map((h, i) => (
            <li key={`${h.status}-${h.at}-${i}`} className="relative">
              <span
                className="absolute top-1.5 -inset-s-7.75 size-3 rounded-full border-2 border-surface bg-brand"
                aria-hidden
              />
              <div className="flex flex-wrap items-center gap-2">
                <RequestStatus status={h.status} />
                <span className="text-xs text-fg-subtle">{date(h.at)}</span>
              </div>
              {h.note ? <p className="mt-1.5 text-sm text-fg-muted">{h.note}</p> : null}
            </li>
          ))}
        </ol>
      </section>
    </Container>
  );
};

export default RequestDetail;
