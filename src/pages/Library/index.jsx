import { useState } from "react";
import { Link } from "react-router-dom";
import { LuBookOpen, LuBookOpenCheck, LuCalendarClock, LuHistory, LuTicket } from "react-icons/lu";
import { useI18n } from "@/i18n";
import { useMyPackages, useMyRentals, useRentalAction } from "@/hooks/useRentals";
import AccountPage from "@/components/account/AccountPage";
import { Badge, BookCover, Button, Card, EmptyState, ErrorState, Modal, Skeleton } from "@/ui";

const TONE = {
  pending_payment: "warning",
  payment_review: "info",
  scheduled: "brand",
  active: "success",
  completed: "neutral",
  cancelled: "neutral",
};

const isLive = (r, now) => new Date(r.startDate) <= now && new Date(r.endDate) > now;

/** Split rentals into reading now / upcoming / history. */
const group = (list) => {
  const now = new Date();
  const reading = [];
  const upcoming = [];
  const history = [];
  for (const r of list) {
    if (["completed", "cancelled"].includes(r.status) || new Date(r.endDate) <= now)
      history.push(r);
    else if (["active", "scheduled"].includes(r.status) && isLive(r, now)) reading.push(r);
    else upcoming.push(r);
  }
  upcoming.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
  return { reading, upcoming, history };
};

const RentalRow = ({ rental, kind, onConfirm }) => {
  const { t, date } = useI18n();
  const book = rental.bookId ?? {};
  const extend = useRentalAction("extend");
  const startNow = useRentalAction("startNow");

  const meta =
    kind === "reading"
      ? t("library.until", { date: date(rental.endDate) })
      : kind === "upcoming"
        ? t("library.startsOn", { date: date(rental.startDate) })
        : rental.status === "cancelled"
          ? t("library.cancelledOn", { date: date(rental.cancelledAt ?? rental.updatedAt) })
          : t("library.endedOn", { date: date(rental.returnedAt ?? rental.endDate) });

  return (
    <Card padded={false} className="flex gap-4 p-4 sm:p-5">
      <Link to={`/books/${book._id}`} className="shrink-0">
        <BookCover src={book.coverImage?.url} title={book.title} author={book.author} size="sm" />
      </Link>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0">
            <Link
              to={`/books/${book._id}`}
              className="line-clamp-2 font-serif text-lg font-semibold hover:text-brand"
            >
              {book.title}
            </Link>
            <p className="truncate text-sm text-fg-muted">{book.author}</p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <Badge tone={TONE[rental.status]} dot>
              {t(`library.status.${rental.status}`)}
            </Badge>
            {rental.paymentMethod === "credit" ? (
              <Badge tone="gold">{t("rent.viaCredit")}</Badge>
            ) : null}
            {rental.extended ? <Badge>{t("library.extended")}</Badge> : null}
          </div>
        </div>
        <p className="mt-2 text-sm text-fg-subtle">
          {meta}
          {rental.status === "cancelled" && rental.cancelReason
            ? ` · ${t(`library.cancelReason.${rental.cancelReason}`)}`
            : null}
        </p>

        <div className="mt-auto flex flex-wrap gap-2 pt-4">
          {kind === "reading" ? (
            <>
              <Button size="sm" icon={<LuBookOpen aria-hidden />} to={`/read/${book._id}`}>
                {t("library.read")}
              </Button>
              {!rental.extended ? (
                <Button
                  size="sm"
                  variant="secondary"
                  loading={extend.isPending}
                  onClick={() => extend.mutate(rental)}
                >
                  {t("library.extend")}
                </Button>
              ) : null}
              <Button size="sm" variant="ghost" onClick={() => onConfirm("return", rental)}>
                {t("library.returnBook")}
              </Button>
            </>
          ) : null}
          {kind === "upcoming" ? (
            <>
              {rental.status === "pending_payment" && rental.payment ? (
                <Button size="sm" to={`/account/payments/${rental.payment}`}>
                  {t("library.payNow")}
                </Button>
              ) : null}
              {rental.status === "payment_review" && rental.payment ? (
                <Button size="sm" variant="secondary" to={`/account/payments/${rental.payment}`}>
                  {t("library.viewPayment")}
                </Button>
              ) : null}
              {rental.status === "scheduled" ? (
                <Button
                  size="sm"
                  variant="secondary"
                  loading={startNow.isPending}
                  onClick={() => startNow.mutate(rental)}
                >
                  {t("library.startNow")}
                </Button>
              ) : null}
              <Button
                size="sm"
                variant="ghost"
                className="text-danger hover:bg-danger-soft"
                onClick={() => onConfirm("cancel", rental)}
              >
                {t("library.cancel")}
              </Button>
            </>
          ) : null}
        </div>
      </div>
    </Card>
  );
};

const Section = ({ icon: Icon, title, items, kind, empty, onConfirm, action }) => {
  const { t } = useI18n();
  return (
    <section>
      <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold">
        <Icon className="text-gold" aria-hidden /> {title}
        {items.length ? (
          <span className="text-base font-normal text-fg-subtle">({items.length})</span>
        ) : null}
      </h2>
      {items.length ? (
        <ul className="grid gap-4 lg:grid-cols-2">
          {items.map((r) => (
            <li key={r._id}>
              <RentalRow rental={r} kind={kind} onConfirm={onConfirm} />
            </li>
          ))}
        </ul>
      ) : (
        <p className="rounded-card border border-dashed border-line-strong px-5 py-6 text-sm text-fg-muted">
          {empty}
          {action ? (
            <>
              {" "}
              <Link to="/books" className="font-medium text-brand hover:underline">
                {t("library.browse")} →
              </Link>
            </>
          ) : null}
        </p>
      )}
    </section>
  );
};

/** /account: the reader's library + plan credits. */
const Library = () => {
  const { t, date } = useI18n();
  const { data: list = [], isLoading, isError, error, refetch } = useMyRentals();
  const pkgs = useMyPackages();
  const cancel = useRentalAction("cancel");
  const giveBack = useRentalAction("return");
  const [confirm, setConfirm] = useState(null); // { kind, rental }

  const { reading, upcoming, history } = group(list);
  const credits = pkgs.data?.creditsAvailable ?? 0;
  const busy = cancel.isPending || giveBack.isPending;

  const runConfirm = () => {
    const action = confirm.kind === "cancel" ? cancel : giveBack;
    action.mutate(confirm.rental, { onSettled: () => setConfirm(null) });
  };

  return (
    <AccountPage title={t("library.title")} description={t("library.description")}>
      <Card padded={false} className="mb-10 flex flex-wrap items-center gap-4 p-5">
        <span className="flex size-11 items-center justify-center rounded-lg bg-gold-soft text-xl text-gold">
          <LuTicket aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm text-fg-muted">{t("library.credits")}</p>
          <p className="text-lg font-semibold">
            {pkgs.isLoading ? (
              <Skeleton className="h-5 w-24" />
            ) : (
              t("library.creditsLeft", { count: credits })
            )}
          </p>
          {pkgs.data?.nextExpiry ? (
            <p className="text-xs text-fg-subtle">
              {t("plans.expiresOn", { date: date(pkgs.data.nextExpiry) })}
            </p>
          ) : null}
        </div>
        <Button variant="secondary" to="/plans">
          {t("library.buyPlan")}
        </Button>
      </Card>

      {isError ? (
        <ErrorState error={error} onRetry={refetch} />
      ) : isLoading ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {[0, 1].map((i) => (
            <Skeleton key={i} className="h-40 w-full" rounded="rounded-card" />
          ))}
        </div>
      ) : list.length === 0 ? (
        <EmptyState
          icon={<LuBookOpenCheck />}
          title={t("library.readingEmpty")}
          action={<Button to="/books">{t("library.browse")}</Button>}
        />
      ) : (
        <div className="space-y-12">
          <Section
            icon={LuBookOpen}
            title={t("library.reading")}
            items={reading}
            kind="reading"
            empty={t("library.readingEmpty")}
            action
            onConfirm={(kind, rental) => setConfirm({ kind, rental })}
          />
          <Section
            icon={LuCalendarClock}
            title={t("library.upcoming")}
            items={upcoming}
            kind="upcoming"
            empty={t("library.upcomingEmpty")}
            onConfirm={(kind, rental) => setConfirm({ kind, rental })}
          />
          <Section
            icon={LuHistory}
            title={t("library.history")}
            items={history}
            kind="history"
            empty={t("library.historyEmpty")}
          />
        </div>
      )}

      <Modal
        open={Boolean(confirm)}
        onClose={() => setConfirm(null)}
        size="sm"
        title={
          confirm?.kind === "cancel"
            ? t("library.confirmCancelTitle")
            : t("library.confirmReturnTitle")
        }
        footer={
          <>
            <Button variant="secondary" onClick={() => setConfirm(null)} disabled={busy}>
              {t("library.keep")}
            </Button>
            <Button variant="danger" loading={busy} onClick={runConfirm}>
              {confirm?.kind === "cancel" ? t("library.cancel") : t("library.returnBook")}
            </Button>
          </>
        }
      >
        <p className="text-sm text-fg-muted">
          {confirm?.kind === "return"
            ? t("library.confirmReturnBody")
            : confirm?.rental?.paymentMethod === "credit"
              ? t("library.confirmCancelCredit")
              : t("library.confirmCancelPaid")}
        </p>
        {confirm ? (
          <p className="mt-2 font-serif font-semibold">{confirm.rental.bookId?.title}</p>
        ) : null}
      </Modal>
    </AccountPage>
  );
};

export default Library;
