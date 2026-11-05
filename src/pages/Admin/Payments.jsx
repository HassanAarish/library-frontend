import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { LuExternalLink, LuSearch } from "react-icons/lu";
import { admin } from "@/lib/api";
import { qk } from "@/lib/queryClient";
import { useI18n } from "@/i18n";
import { useDebouncedValue, useDocumentTitle } from "@/hooks/useBooks";
import { useAdminAction, useAdminStats } from "@/hooks/useAdmin";
import AdminTable, { AdminFilters, AdminPage, Cell } from "@/components/admin/AdminTable";
import { PaymentBadge, RefundBadge } from "@/components/admin/badges";
import { Alert, Button, DetailList, Drawer, Field, Input, Segmented, Textarea } from "@/ui";

// Each tab = a backend filter.
const VIEWS = {
  review: { status: "submitted" },
  refunds: { "refund.status": "requested" },
  approved: { status: "approved" },
  rejected: { status: "rejected" },
  all: {},
};

/** Side panel: everything needed to check one transfer, and the decisions. */
const PaymentPanel = ({ payment, onClose }) => {
  const { t, price, dateTime } = useI18n();
  const [reason, setReason] = useState("");
  const [rejecting, setRejecting] = useState(false);
  const [refundNote, setRefundNote] = useState("");
  // Signed links expire; fall back to the "no screenshot" line instead of a broken image.
  const [shotFailed, setShotFailed] = useState(false);

  const approve = useAdminAction(() => admin.approvePayment(payment._id), { onSuccess: onClose });
  const reject = useAdminAction(() => admin.rejectPayment(payment._id, reason.trim()), {
    onSuccess: onClose,
  });
  const refund = useAdminAction(
    (status) => admin.resolveRefund(payment._id, { status, note: refundNote.trim() || undefined }),
    {
      onSuccess: onClose,
    },
  );

  const p = payment;
  const what =
    p.purpose === "rental"
      ? `${t("admin.pay.rental")}: ${p.rental?.bookId?.title ?? "—"}`
      : `${t("admin.pay.package")}: ${p.userPackage?.snapshot?.name ?? "—"}`;
  const canReview = p.status === "submitted";

  return (
    <Drawer
      open
      onClose={onClose}
      title={price(p.amount)}
      description={what}
      footer={
        canReview ? (
          rejecting ? (
            <>
              <Button variant="secondary" onClick={() => setRejecting(false)}>
                {t("common.cancel")}
              </Button>
              <Button
                variant="danger"
                loading={reject.isPending}
                disabled={!reason.trim()}
                onClick={() => reject.mutate()}
              >
                {t("admin.pay.reject")}
              </Button>
            </>
          ) : (
            <>
              <Button variant="secondary" onClick={() => setRejecting(true)}>
                {t("admin.pay.reject")}
              </Button>
              <Button loading={approve.isPending} onClick={() => approve.mutate()}>
                {t("admin.pay.approve")}
              </Button>
            </>
          )
        ) : null
      }
    >
      <div className="space-y-5">
        <div className="flex flex-wrap gap-2">
          <PaymentBadge status={p.status} />
          <RefundBadge status={p.refund?.status} />
        </div>

        {canReview ? <Alert tone="info">{t("admin.pay.checkTip")}</Alert> : null}

        <DetailList
          items={[
            [t("admin.common.user"), p.user ? `${p.user.name} · ${p.user.email}` : "—"],
            [t("admin.pay.reference"), <span className="font-mono">{p.reference}</span>],
            [
              t("admin.pay.tid"),
              p.proof?.transactionId ? (
                <span className="font-mono">{p.proof.transactionId}</span>
              ) : null,
            ],
            [
              t("admin.pay.sender"),
              [p.proof?.senderNumber, p.proof?.senderName].filter(Boolean).join(" · "),
            ],
            [t("admin.pay.submitted"), p.proof?.submittedAt ? dateTime(p.proof.submittedAt) : null],
            [t("admin.common.created"), dateTime(p.createdAt)],
            [t("payment.rejectedReason", { reason: "" }).replace(/:\s*$/, ""), p.rejectionReason],
            [
              t("admin.common.status"),
              p.reviewedAt ? t("admin.pay.reviewedOn", { date: dateTime(p.reviewedAt) }) : null,
            ],
          ]}
        />

        <section>
          <h3 className="mb-2 text-sm font-semibold">{t("admin.pay.screenshot")}</h3>
          {p.screenshotUrl && !shotFailed ? (
            <a href={p.screenshotUrl} target="_blank" rel="noreferrer" className="group block">
              <img
                src={p.screenshotUrl}
                alt={t("admin.pay.screenshot")}
                onError={() => setShotFailed(true)}
                className="max-h-112 w-full rounded-lg border border-line bg-sunken object-contain"
              />
              <span className="mt-1 inline-flex items-center gap-1 text-xs text-brand group-hover:underline">
                <LuExternalLink aria-hidden /> {t("admin.pay.openFull")}
              </span>
            </a>
          ) : (
            <p className="text-sm text-fg-subtle">{t("admin.pay.noScreenshot")}</p>
          )}
        </section>

        {rejecting ? (
          <Field label={t("admin.pay.rejectReason")}>
            <Textarea
              rows={3}
              autoFocus
              maxLength={500}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={t("admin.pay.rejectPlaceholder")}
            />
          </Field>
        ) : null}

        {p.refund?.status === "requested" ? (
          <section className="rounded-lg border border-warning/40 bg-warning-soft p-4">
            <h3 className="font-semibold">{t("admin.pay.refundTitle")}</h3>
            <p className="mt-1 text-sm text-fg-muted">
              {t("admin.pay.refundRequested", { amount: p.amount })}
            </p>
            <Field label={t("admin.common.note")} className="mt-3">
              <Input
                value={refundNote}
                onChange={(e) => setRefundNote(e.target.value)}
                maxLength={500}
              />
            </Field>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button
                size="sm"
                loading={refund.isPending && refund.variables === "refunded"}
                onClick={() => refund.mutate("refunded")}
              >
                {t("admin.pay.markRefunded")}
              </Button>
              <Button
                size="sm"
                variant="secondary"
                loading={refund.isPending && refund.variables === "declined"}
                onClick={() => refund.mutate("declined")}
              >
                {t("admin.pay.declineRefund")}
              </Button>
            </div>
          </section>
        ) : null}
      </div>
    </Drawer>
  );
};

/** /admin/payments: review queue, refunds, history. */
const Payments = () => {
  const { t, price, relative } = useI18n();
  useDocumentTitle(t("admin.payments"));
  const [params, setParams] = useSearchParams();
  const view = VIEWS[params.get("view")] ? params.get("view") : "review";
  const [draft, setDraft] = useState(params.get("search") ?? "");
  const search = useDebouncedValue(draft);
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(null);
  const stats = useAdminStats();

  // eslint-disable-next-line react-hooks/set-state-in-effect -- new filter → first page
  useEffect(() => setPage(1), [view, search]);

  const query = useQuery({
    queryKey: qk.admin("payments", { view, search, page }),
    queryFn: () => admin.payments({ ...VIEWS[view], search, page, limit: 20 }),
    placeholderData: keepPreviousData,
  });

  const setView = (v) => {
    const next = new URLSearchParams(params);
    next.set("view", v);
    setParams(next, { replace: true });
  };

  return (
    <AdminPage title={t("admin.payments")} description={t("admin.pay.description")}>
      <AdminFilters>
        <Segmented
          label={t("admin.common.status")}
          value={view}
          onChange={setView}
          options={[
            ["review", t("admin.pay.toReview"), stats.data?.todo.paymentsToReview],
            ["refunds", t("admin.pay.refunds"), stats.data?.todo.refundsToSend],
            ["approved", t("admin.pay.approved")],
            ["rejected", t("admin.pay.rejected")],
            ["all", t("admin.pay.all")],
          ]}
        />
        <div className="sm:ms-auto sm:w-72">
          <Input
            type="search"
            aria-label={t("admin.common.search")}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={t("admin.pay.searchPlaceholder")}
            startIcon={<LuSearch />}
          />
        </div>
      </AdminFilters>

      <AdminTable
        query={query}
        page={page}
        onPage={setPage}
        onRowClick={setOpen}
        empty={t("admin.common.empty")}
        columns={[
          {
            key: "user",
            header: t("admin.common.user"),
            primary: true,
            cell: (p) => <Cell title={p.user?.name ?? "—"} sub={p.user?.email} />,
          },
          {
            key: "for",
            header: t("admin.pay.purpose"),
            cell: (p) =>
              p.purpose === "rental"
                ? (p.rental?.bookId?.title ?? t("admin.pay.rental"))
                : (p.userPackage?.snapshot?.name ?? t("admin.pay.package")),
          },
          {
            key: "amount",
            header: t("admin.common.amount"),
            cell: (p) => <span className="font-medium">{price(p.amount)}</span>,
          },
          {
            key: "tid",
            header: t("admin.pay.tid"),
            cell: (p) => (
              <span className="font-mono text-xs">{p.proof?.transactionId ?? p.reference}</span>
            ),
          },
          {
            key: "status",
            header: t("admin.common.status"),
            cell: (p) => (
              <div className="flex flex-wrap gap-1">
                <PaymentBadge status={p.status} />
                <RefundBadge status={p.refund?.status} />
              </div>
            ),
          },
          {
            key: "when",
            header: t("admin.common.date"),
            cell: (p) => (
              <span className="text-fg-muted">{relative(p.proof?.submittedAt ?? p.createdAt)}</span>
            ),
          },
        ]}
      />

      {open ? <PaymentPanel key={open._id} payment={open} onClose={() => setOpen(null)} /> : null}
    </AdminPage>
  );
};

export default Payments;
