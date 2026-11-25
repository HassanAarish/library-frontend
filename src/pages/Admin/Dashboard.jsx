import { Link, useNavigate } from "react-router-dom";
import {
  LuBookOpen,
  LuBookPlus,
  LuCalendarClock,
  LuCircleCheck,
  LuPlus,
  LuTags,
  LuTicket,
  LuUndo2,
  LuUsers,
  LuWallet,
} from "react-icons/lu";
import { useI18n } from "@/i18n";
import { useDocumentTitle } from "@/hooks/useBooks";
import { useAdminList, useAdminStats } from "@/hooks/useAdmin";
import { admin } from "@/lib/api";
import AdminTable, { AdminPage, Cell } from "@/components/admin/AdminTable";
import { Button, Card, ErrorState, Skeleton, cn } from "@/ui";
import { PaymentBadge } from "@/components/admin/badges";

const Todo = ({ to, icon: Icon, label, count }) => (
  <Link
    to={to}
    className={cn(
      "flex items-center gap-4 rounded-card border p-4 transition-colors",
      count
        ? "border-warning/40 bg-warning-soft hover:bg-warning-soft/70"
        : "border-line bg-surface hover:bg-sunken",
    )}
  >
    <span
      className={cn(
        "flex size-10 shrink-0 items-center justify-center rounded-lg text-lg",
        count ? "bg-warning text-white" : "bg-sunken text-fg-subtle",
      )}
    >
      <Icon aria-hidden />
    </span>
    <span className="min-w-0 flex-1 text-sm font-medium text-fg">{label}</span>
    <span className="font-serif text-2xl font-semibold">{count}</span>
  </Link>
);

const Stat = ({ icon: Icon, label, value, sub }) => (
  <Card padded={false} className="p-5">
    <div className="flex items-center gap-2 text-sm text-fg-muted">
      <Icon className="text-gold" aria-hidden /> {label}
    </div>
    <p className="mt-2 font-serif text-3xl font-semibold">{value}</p>
    {sub ? <p className="mt-0.5 text-xs text-fg-subtle">{sub}</p> : null}
  </Card>
);

/** /admin: the to-do queues first, then totals and the latest payments. */
const Dashboard = () => {
  const { t, price, number, relative } = useI18n();
  useDocumentTitle(t("admin.dash.title"));
  const navigate = useNavigate();
  const stats = useAdminStats();
  const latest = useAdminList("payments", admin.payments, {}, { limit: 5 });
  const s = stats.data;
  const todos = s
    ? s.todo.paymentsToReview +
      s.todo.refundsToSend +
      s.todo.openRequests +
      s.todo.pendingCategories
    : 0;

  return (
    <AdminPage
      title={t("admin.dash.title")}
      description={t("admin.dash.description")}
      actions={
        <>
          <Button variant="secondary" to="/admin/payments" icon={<LuWallet aria-hidden />}>
            {t("admin.dash.reviewPayments")}
          </Button>
          <Button to="/admin/books/new" icon={<LuPlus aria-hidden />}>
            {t("admin.dash.addBook")}
          </Button>
        </>
      }
    >
      {stats.isError ? (
        <ErrorState error={stats.error} onRetry={stats.refetch} />
      ) : (
        <>
          <section aria-labelledby="todo-title">
            <h2 id="todo-title" className="mb-3 text-lg font-semibold">
              {t("admin.dash.todo")}
            </h2>
            {stats.isLoading ? (
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {[0, 1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-18 w-full" rounded="rounded-card" />
                ))}
              </div>
            ) : (
              <>
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  <Todo
                    to="/admin/payments"
                    icon={LuWallet}
                    label={t("admin.dash.paymentsToReview")}
                    count={s.todo.paymentsToReview}
                  />
                  <Todo
                    to="/admin/payments?view=refunds"
                    icon={LuUndo2}
                    label={t("admin.dash.refundsToSend")}
                    count={s.todo.refundsToSend}
                  />
                  <Todo
                    to="/admin/requests"
                    icon={LuBookPlus}
                    label={t("admin.dash.openRequests")}
                    count={s.todo.openRequests}
                  />
                  <Todo
                    to="/admin/categories"
                    icon={LuTags}
                    label={t("admin.dash.pendingCategories")}
                    count={s.todo.pendingCategories}
                  />
                </div>
                {todos === 0 ? (
                  <p className="mt-3 flex items-center gap-2 text-sm text-success">
                    <LuCircleCheck aria-hidden /> {t("admin.dash.allClear")}
                  </p>
                ) : null}
              </>
            )}
          </section>

          <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            {stats.isLoading ? (
              [0, 1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-28 w-full" rounded="rounded-card" />
              ))
            ) : (
              <>
                <Stat
                  icon={LuWallet}
                  label={t("admin.dash.revenue")}
                  value={price(s.revenue30d.amount)}
                  sub={t("admin.dash.revenuePayments", { count: s.revenue30d.payments })}
                />
                <Stat
                  icon={LuBookOpen}
                  label={t("admin.dash.readingNow")}
                  value={number(s.rentals.readingNow)}
                />
                <Stat
                  icon={LuCalendarClock}
                  label={t("admin.dash.upcoming")}
                  value={number(s.rentals.upcoming)}
                />
                <Stat
                  icon={LuUsers}
                  label={t("admin.dash.readers")}
                  value={number(s.people.readers)}
                  sub={`${number(s.catalogue.publishedBooks)} ${t("admin.dash.publishedBooks").toLowerCase()}`}
                />
                <Stat
                  icon={LuTicket}
                  label={t("admin.dash.activePackages")}
                  value={number(s.people.activePackages)}
                />
              </>
            )}
          </section>
        </>
      )}

      <section className="mt-10">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">{t("admin.dash.latestPayments")}</h2>
          <Button variant="link" size="sm" to="/admin/payments?view=all">
            {t("notifications.viewAll")} →
          </Button>
        </div>
        <AdminTable
          query={latest.query}
          empty={t("admin.common.empty")}
          columns={[
            {
              key: "user",
              header: t("admin.common.user"),
              primary: true,
              cell: (p) => <Cell title={p.user?.name ?? "—"} sub={p.user?.email} />,
            },
            {
              key: "ref",
              header: t("admin.pay.reference"),
              cell: (p) => <span className="font-mono text-xs">{p.reference}</span>,
            },
            { key: "amount", header: t("admin.common.amount"), cell: (p) => price(p.amount) },
            {
              key: "status",
              header: t("admin.common.status"),
              cell: (p) => <PaymentBadge status={p.status} />,
            },
            {
              key: "when",
              header: t("admin.common.created"),
              cell: (p) => <span className="text-fg-muted">{relative(p.createdAt)}</span>,
            },
          ]}
          onRowClick={(p) => navigate(`/admin/payments?view=all&search=${p.reference}`)}
        />
      </section>
    </AdminPage>
  );
};

export default Dashboard;
