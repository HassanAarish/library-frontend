import { Link } from "react-router-dom";
import { LuWallet } from "react-icons/lu";
import { useState } from "react";
import { useI18n } from "@/i18n";
import { useMyPayments } from "@/hooks/useRentals";
import AccountPage from "@/components/account/AccountPage";
import { Badge, Card, EmptyState, ErrorState, Pagination, Skeleton } from "@/ui";

const STATUS_TONE = {
  awaiting_proof: "warning",
  submitted: "info",
  approved: "success",
  rejected: "danger",
  expired: "neutral",
  cancelled: "neutral",
};

/** /account/payments: every payment with its status; each opens its page. */
const Payments = () => {
  const { t, price, dateTime } = useI18n();
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, error, refetch } = useMyPayments({ page, limit: 15 });
  const list = data?.results ?? [];

  return (
    <AccountPage title={t("payment.mineTitle")} description={t("payment.mineDescription")}>
      {isError ? (
        <ErrorState error={error} onRetry={refetch} />
      ) : isLoading ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-20 w-full" rounded="rounded-card" />
          ))}
        </div>
      ) : list.length === 0 ? (
        <EmptyState icon={<LuWallet />} title={t("payment.mineEmpty")} />
      ) : (
        <>
          <ul className="space-y-3">
            {list.map((p) => (
              <li key={p._id}>
                <Card
                  as={Link}
                  to={`/account/payments/${p._id}`}
                  interactive
                  padded={false}
                  className="flex flex-wrap items-center gap-x-6 gap-y-2 p-4 sm:p-5"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">
                      {p.purpose === "package" ? t("payment.forPackage") : t("payment.forRental")}
                      <span className="ms-2 font-mono text-sm text-fg-muted">{p.reference}</span>
                    </p>
                    <p className="mt-0.5 text-sm text-fg-subtle">{dateTime(p.createdAt)}</p>
                  </div>
                  <p className="font-semibold">{price(p.amount)}</p>
                  <div className="flex flex-wrap gap-2">
                    <Badge tone={STATUS_TONE[p.status]} dot>
                      {t(`payment.status.${p.status}`)}
                    </Badge>
                    {p.refund?.status ? (
                      <Badge tone="info">{t(`payment.refund.${p.refund.status}`)}</Badge>
                    ) : null}
                  </div>
                </Card>
              </li>
            ))}
          </ul>
          <Pagination page={page} totalPages={data?.totalPages} onChange={setPage} />
        </>
      )}
    </AccountPage>
  );
};

export default Payments;
