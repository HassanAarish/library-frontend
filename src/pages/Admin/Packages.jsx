import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useFormik } from "formik";
import { LuPlus } from "react-icons/lu";
import * as Yup from "yup";
import { admin } from "@/lib/api";
import { qk } from "@/lib/queryClient";
import { useI18n } from "@/i18n";
import { useDocumentTitle } from "@/hooks/useBooks";
import { useAdminAction, useAdminList } from "@/hooks/useAdmin";
import AdminTable, { AdminPage, Cell } from "@/components/admin/AdminTable";
import { PaymentBadge } from "@/components/admin/badges";
import { fieldError } from "@/pages/Auth/forms";
import { Badge, Button, Field, Input, Modal, Segmented, Switch, Textarea } from "@/ui";

const PKG_TONE = {
  active: "success",
  pending_payment: "warning",
  expired: "neutral",
  rejected: "danger",
  cancelled: "neutral",
};

const PlanModal = ({ plan, onClose }) => {
  const { t } = useI18n();
  const isNew = !plan?._id;
  const save = useAdminAction(
    (values) => {
      const body = { ...values, name: values.name.trim(), description: values.description.trim() };
      return isNew ? admin.createPlan(body) : admin.updatePlan(plan._id, body);
    },
    { alsoInvalidate: [["packages"]], onSuccess: onClose },
  );
  const formik = useFormik({
    initialValues: {
      name: plan?.name ?? "",
      description: plan?.description ?? "",
      credits: String(plan?.credits ?? 5),
      price: String(plan?.price ?? ""),
      validityDays: String(plan?.validityDays ?? 365),
      sortOrder: String(plan?.sortOrder ?? 0),
      isActive: plan?.isActive ?? true,
    },
    validationSchema: Yup.object({
      name: Yup.string().trim().required(t("admin.booksPage.required")),
      credits: Yup.number()
        .typeError(t("admin.booksPage.required"))
        .integer()
        .min(1)
        .max(100)
        .required(),
      price: Yup.number()
        .typeError(t("admin.booksPage.required"))
        .integer()
        .min(0)
        .required(t("admin.booksPage.required")),
      validityDays: Yup.number().integer().min(1).max(3650).required(),
    }),
    onSubmit: (v) => save.mutate(v),
  });

  return (
    <Modal
      open
      onClose={onClose}
      title={isNew ? t("admin.pkg.add") : plan.name}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            {t("common.cancel")}
          </Button>
          <Button loading={save.isPending} onClick={formik.submitForm}>
            {t("admin.common.save")}
          </Button>
        </>
      }
    >
      <form onSubmit={formik.handleSubmit} noValidate className="grid gap-4 sm:grid-cols-2">
        <Field
          label={t("admin.pkg.name")}
          error={fieldError(formik, "name")}
          className="sm:col-span-2"
        >
          <Input maxLength={60} placeholder="5 Books" {...formik.getFieldProps("name")} />
        </Field>
        <Field label={t("admin.pkg.credits")} error={fieldError(formik, "credits")}>
          <Input type="number" min={1} max={100} {...formik.getFieldProps("credits")} />
        </Field>
        <Field label={t("admin.pkg.price")} error={fieldError(formik, "price")}>
          <Input type="number" min={0} {...formik.getFieldProps("price")} />
        </Field>
        <Field label={t("admin.pkg.validity")} error={fieldError(formik, "validityDays")}>
          <Input type="number" min={1} max={3650} {...formik.getFieldProps("validityDays")} />
        </Field>
        <Field label={t("admin.pkg.order")}>
          <Input type="number" min={0} max={1000} {...formik.getFieldProps("sortOrder")} />
        </Field>
        <Field label={t("admin.pkg.descriptionLabel")} className="sm:col-span-2">
          <Textarea rows={2} maxLength={500} {...formik.getFieldProps("description")} />
        </Field>
        <Switch
          className="sm:col-span-2"
          label={t("admin.pkg.active")}
          checked={formik.values.isActive}
          onChange={(v) => formik.setFieldValue("isActive", v)}
        />
        <button type="submit" hidden />
      </form>
    </Modal>
  );
};

/** /admin/packages: plans on sale + every purchase. */
const Packages = () => {
  const { t, price, date, relative } = useI18n();
  useDocumentTitle(t("admin.packages"));
  const [view, setView] = useState("plans");
  const [open, setOpen] = useState(null);
  const plans = useQuery({ queryKey: qk.admin("plans"), queryFn: admin.plans });
  const purchases = useAdminList("purchases", admin.purchases);

  return (
    <AdminPage
      title={t("admin.packages")}
      description={t("admin.pkg.description")}
      actions={
        view === "plans" ? (
          <Button icon={<LuPlus aria-hidden />} onClick={() => setOpen({})}>
            {t("admin.pkg.add")}
          </Button>
        ) : null
      }
    >
      <Segmented
        className="mb-4"
        value={view}
        onChange={setView}
        options={[
          ["plans", t("admin.pkg.plans")],
          ["purchases", t("admin.pkg.purchases")],
        ]}
      />

      {view === "plans" ? (
        <AdminTable
          query={plans}
          onRowClick={setOpen}
          empty={t("admin.common.empty")}
          columns={[
            {
              key: "name",
              header: t("admin.pkg.name"),
              primary: true,
              cell: (p) => <Cell title={p.name} sub={p.description} />,
            },
            { key: "credits", header: t("admin.pkg.credits"), cell: (p) => p.credits },
            {
              key: "price",
              header: t("admin.pkg.price"),
              cell: (p) => (
                <Cell
                  title={price(p.price)}
                  sub={t("admin.pkg.perBook", { price: price(Math.round(p.price / p.credits)) })}
                />
              ),
            },
            { key: "validity", header: t("admin.pkg.validity"), cell: (p) => p.validityDays },
            {
              key: "active",
              header: t("admin.common.status"),
              cell: (p) => (
                <Badge tone={p.isActive ? "success" : "neutral"} dot>
                  {p.isActive ? t("admin.pkg.active") : t("admin.pkg.inactive")}
                </Badge>
              ),
            },
          ]}
        />
      ) : (
        <AdminTable
          query={purchases.query}
          page={purchases.params.page}
          onPage={purchases.setPage}
          empty={t("admin.common.empty")}
          columns={[
            {
              key: "user",
              header: t("admin.common.user"),
              primary: true,
              cell: (u) => <Cell title={u.user?.name ?? "—"} sub={u.user?.email} />,
            },
            { key: "plan", header: t("admin.pkg.name"), cell: (u) => u.snapshot?.name },
            {
              key: "used",
              header: t("admin.pkg.credits"),
              cell: (u) =>
                t("admin.pkg.creditsUsed", { used: u.creditsUsed, total: u.creditsTotal }),
            },
            {
              key: "status",
              header: t("admin.common.status"),
              cell: (u) => (
                <div className="flex flex-wrap gap-1">
                  <Badge tone={PKG_TONE[u.status]} dot>
                    {t(`admin.pkg.status.${u.status}`)}
                  </Badge>
                  {u.payment?.status ? <PaymentBadge status={u.payment.status} /> : null}
                </div>
              ),
            },
            {
              key: "when",
              header: t("admin.common.date"),
              cell: (u) => (
                <span className="text-fg-muted">
                  {u.expiresAt
                    ? t("admin.pkg.expires", { date: date(u.expiresAt) })
                    : relative(u.createdAt)}
                </span>
              ),
            },
          ]}
        />
      )}
      {open ? <PlanModal plan={open} onClose={() => setOpen(null)} /> : null}
    </AdminPage>
  );
};

export default Packages;
