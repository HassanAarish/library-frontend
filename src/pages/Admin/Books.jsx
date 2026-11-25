import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LuPlus, LuSearch } from "react-icons/lu";
import { admin } from "@/lib/api";
import { useI18n } from "@/i18n";
import { useDebouncedValue, useDocumentTitle } from "@/hooks/useBooks";
import { useAdminList } from "@/hooks/useAdmin";
import AdminTable, { AdminFilters, AdminPage, Cell } from "@/components/admin/AdminTable";
import { BookStatusBadge } from "@/components/admin/badges";
import { BookCover, Button, Input, Segmented } from "@/ui";

/** /admin/books: the catalogue, drafts included. Rows open the editor. */
const Books = () => {
  const { t, price } = useI18n();
  useDocumentTitle(t("admin.books"));
  const navigate = useNavigate();
  const list = useAdminList("books", admin.books);
  const [draft, setDraft] = useState("");
  const search = useDebouncedValue(draft);
  useEffect(() => {
    if (search !== (list.params.search ?? "")) list.set({ search });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only when typing settles
  }, [search]);

  return (
    <AdminPage
      title={t("admin.books")}
      description={t("admin.booksPage.description")}
      actions={
        <Button to="/admin/books/new" icon={<LuPlus aria-hidden />}>
          {t("admin.booksPage.add")}
        </Button>
      }
    >
      <AdminFilters>
        <Segmented
          label={t("admin.common.status")}
          value={list.params.status ?? ""}
          onChange={(v) => list.set({ status: v || undefined })}
          options={[
            ["", t("admin.common.all")],
            ["published", t("admin.booksPage.published")],
            ["draft", t("admin.booksPage.draft")],
            ["archived", t("admin.booksPage.archived")],
          ]}
        />
        <div className="sm:ms-auto sm:w-72">
          <Input
            type="search"
            aria-label={t("admin.common.search")}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={t("admin.booksPage.searchPlaceholder")}
            startIcon={<LuSearch />}
          />
        </div>
      </AdminFilters>

      <AdminTable
        query={list.query}
        page={list.params.page}
        onPage={list.setPage}
        onRowClick={(b) => navigate(`/admin/books/${b._id}`)}
        empty={t("admin.common.empty")}
        columns={[
          {
            key: "book",
            header: t("admin.common.book"),
            primary: true,
            cell: (b) => (
              <div className="flex items-center gap-3">
                <BookCover src={b.coverImage?.url} title={b.title} author={b.author} size="xs" />
                <Cell title={b.title} sub={b.author} />
              </div>
            ),
          },
          {
            key: "category",
            header: t("admin.booksPage.category"),
            cell: (b) => b.category?.name ?? "—",
          },
          {
            key: "price",
            header: t("admin.booksPage.price"),
            cell: (b) => (b.price === 0 ? t("catalog.free") : price(b.price)),
          },
          { key: "days", header: t("admin.booksPage.days"), cell: (b) => b.rentalDays },
          { key: "pages", header: t("admin.booksPage.pages"), cell: (b) => b.pageCount ?? "—" },
          {
            key: "status",
            header: t("admin.common.status"),
            cell: (b) => <BookStatusBadge status={b.status} />,
          },
        ]}
      />
    </AdminPage>
  );
};

export default Books;
