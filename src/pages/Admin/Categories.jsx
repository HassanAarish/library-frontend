import { useState } from "react";
import { LuPlus } from "react-icons/lu";
import { admin } from "@/lib/api";
import { useI18n } from "@/i18n";
import { useDocumentTitle } from "@/hooks/useBooks";
import { useAdminAction, useAdminList } from "@/hooks/useAdmin";
import AdminTable, { AdminFilters, AdminPage, Cell } from "@/components/admin/AdminTable";
import { Badge, Button, Field, Input, Modal, Segmented, Textarea } from "@/ui";

const TONE = { pending: "warning", approved: "success", rejected: "danger" };

/** Add / edit / review one category. */
const CategoryModal = ({ category, onClose }) => {
  const { t } = useI18n();
  const isNew = !category?._id;
  const [name, setName] = useState(category?.name ?? "");
  const [description, setDescription] = useState(category?.description ?? "");
  const [note, setNote] = useState("");
  const [confirming, setConfirming] = useState(false); // delete needs a second click
  const pending = category?.status === "pending";

  const create = useAdminAction(
    () => admin.createCategory({ name: name.trim(), description: description.trim() }),
    {
      alsoInvalidate: [["categories"]],
      onSuccess: onClose,
    },
  );
  const update = useAdminAction(
    (status) =>
      admin.updateCategory(category._id, {
        name: name.trim(),
        description: description.trim(),
        ...(status && { status }),
        ...(note.trim() && { note: note.trim() }),
      }),
    { alsoInvalidate: [["categories"]], onSuccess: onClose },
  );
  const remove = useAdminAction(() => admin.deleteCategory(category._id), {
    alsoInvalidate: [["categories"]],
    onSuccess: onClose,
  });

  const valid = name.trim().length >= 2;

  return (
    <Modal
      open
      onClose={onClose}
      title={isNew ? t("admin.cat.add") : category.name}
      footer={
        isNew ? (
          <>
            <Button variant="secondary" onClick={onClose}>
              {t("common.cancel")}
            </Button>
            <Button disabled={!valid} loading={create.isPending} onClick={() => create.mutate()}>
              {t("admin.common.save")}
            </Button>
          </>
        ) : pending ? (
          <>
            <Button
              variant="danger"
              loading={update.isPending && update.variables === "rejected"}
              onClick={() => update.mutate("rejected")}
            >
              {t("admin.cat.reject")}
            </Button>
            <Button
              disabled={!valid}
              loading={update.isPending && update.variables === "approved"}
              onClick={() => update.mutate("approved")}
            >
              {t("admin.cat.approve")}
            </Button>
          </>
        ) : (
          <>
            <Button
              variant="ghost"
              className="me-auto text-danger hover:bg-danger-soft"
              disabled={category.bookCount > 0}
              title={category.bookCount > 0 ? t("admin.cat.deleteBlocked") : undefined}
              loading={remove.isPending}
              onClick={() => (confirming ? remove.mutate() : setConfirming(true))}
            >
              {confirming ? t("admin.cat.deleteConfirm") : t("admin.common.delete")}
            </Button>
            <Button variant="secondary" onClick={onClose}>
              {t("common.cancel")}
            </Button>
            <Button disabled={!valid} loading={update.isPending} onClick={() => update.mutate()}>
              {t("admin.common.save")}
            </Button>
          </>
        )
      }
    >
      <div className="space-y-4">
        {category?.proposedBy ? (
          <p className="text-sm text-fg-muted">
            {t("admin.cat.suggestedBy")}:{" "}
            <span className="text-fg">{category.proposedBy.name}</span> ·{" "}
            {category.proposedBy.email}
          </p>
        ) : null}
        <Field label={t("admin.cat.name")}>
          <Input maxLength={60} value={name} onChange={(e) => setName(e.target.value)} />
        </Field>
        <Field label={t("admin.cat.descriptionLabel")}>
          <Textarea
            rows={2}
            maxLength={500}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </Field>
        {pending ? (
          <Field label={t("admin.cat.note")}>
            <Input maxLength={500} value={note} onChange={(e) => setNote(e.target.value)} />
          </Field>
        ) : null}
      </div>
    </Modal>
  );
};

/** /admin/categories: readers' suggestions first, then everything else. */
const Categories = () => {
  const { t, relative } = useI18n();
  useDocumentTitle(t("admin.categories"));
  const list = useAdminList("categories", admin.categories, { status: "pending" }, { limit: 50 });
  const [open, setOpen] = useState(null); // category | {} for new

  return (
    <AdminPage
      title={t("admin.categories")}
      description={t("admin.cat.description")}
      actions={
        <Button icon={<LuPlus aria-hidden />} onClick={() => setOpen({})}>
          {t("admin.cat.add")}
        </Button>
      }
    >
      <AdminFilters>
        <Segmented
          label={t("admin.common.status")}
          value={list.params.status ?? ""}
          onChange={(v) => list.set({ status: v || undefined })}
          options={[
            ["pending", t("admin.cat.pending")],
            ["approved", t("admin.cat.approved")],
            ["rejected", t("admin.cat.rejected")],
            ["", t("admin.common.all")],
          ]}
        />
      </AdminFilters>
      <AdminTable
        query={list.query}
        page={list.params.page}
        onPage={list.setPage}
        onRowClick={setOpen}
        empty={t("admin.common.empty")}
        columns={[
          {
            key: "name",
            header: t("admin.cat.name"),
            primary: true,
            cell: (c) => <Cell title={c.name} sub={c.description} />,
          },
          { key: "books", header: t("admin.cat.books"), cell: (c) => c.bookCount ?? 0 },
          { key: "by", header: t("admin.cat.suggestedBy"), cell: (c) => c.proposedBy?.name ?? "—" },
          {
            key: "status",
            header: t("admin.common.status"),
            cell: (c) => (
              <Badge tone={TONE[c.status]} dot>
                {t(`admin.cat.${c.status === "pending" ? "pending" : c.status}`)}
              </Badge>
            ),
          },
          {
            key: "when",
            header: t("admin.common.created"),
            cell: (c) => <span className="text-fg-muted">{relative(c.createdAt)}</span>,
          },
        ]}
      />
      {open ? <CategoryModal category={open} onClose={() => setOpen(null)} /> : null}
    </AdminPage>
  );
};

export default Categories;
