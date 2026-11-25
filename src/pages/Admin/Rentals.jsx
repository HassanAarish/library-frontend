import { useI18n } from "@/i18n";
import { admin } from "@/lib/api";
import { useDocumentTitle } from "@/hooks/useBooks";
import { useAdminList } from "@/hooks/useAdmin";
import AdminTable, { AdminFilters, AdminPage, Cell } from "@/components/admin/AdminTable";
import { RentalBadge } from "@/components/admin/badges";
import { Select } from "@/ui";

const STATUSES = [
  "active",
  "scheduled",
  "payment_review",
  "pending_payment",
  "completed",
  "cancelled",
];

/** /admin/rentals: every booking, filterable by status and payment method. */
const Rentals = () => {
  const { t, date, price } = useI18n();
  useDocumentTitle(t("admin.rentals"));
  const list = useAdminList("rentals", admin.rentals);

  return (
    <AdminPage title={t("admin.rentals")} description={t("admin.rent.description")}>
      <AdminFilters>
        <Select
          aria-label={t("admin.common.status")}
          className="sm:w-56"
          value={list.params.status ?? ""}
          onChange={(e) => list.set({ status: e.target.value || undefined })}
        >
          <option value="">{t("admin.common.all")}</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {t(`library.status.${s}`)}
            </option>
          ))}
        </Select>
        <Select
          aria-label={t("admin.rent.method")}
          className="sm:w-48"
          value={list.params.paymentMethod ?? ""}
          onChange={(e) => list.set({ paymentMethod: e.target.value || undefined })}
        >
          <option value="">{t("admin.common.all")}</option>
          <option value="single">{t("admin.rent.single")}</option>
          <option value="credit">{t("admin.rent.credit")}</option>
        </Select>
      </AdminFilters>

      <AdminTable
        query={list.query}
        page={list.params.page}
        onPage={list.setPage}
        empty={t("admin.common.empty")}
        columns={[
          {
            key: "book",
            header: t("admin.common.book"),
            primary: true,
            cell: (r) => <Cell title={r.bookId?.title ?? "—"} sub={r.bookId?.author} />,
          },
          {
            key: "reader",
            header: t("admin.rent.reader"),
            cell: (r) => <Cell title={r.renterId?.name ?? "—"} sub={r.renterId?.email} />,
          },
          {
            key: "period",
            header: t("admin.rent.period"),
            cell: (r) => (
              <span className="whitespace-nowrap text-fg-muted">
                {date(r.startDate)} → {date(r.endDate)}
              </span>
            ),
          },
          {
            key: "method",
            header: t("admin.rent.method"),
            cell: (r) => (r.paymentMethod === "credit" ? t("admin.rent.credit") : price(r.price)),
          },
          {
            key: "status",
            header: t("admin.common.status"),
            cell: (r) => <RentalBadge status={r.status} />,
          },
        ]}
      />
    </AdminPage>
  );
};

export default Rentals;
