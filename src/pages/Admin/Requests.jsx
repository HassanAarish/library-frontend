import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { LuSearch, LuUsers } from "react-icons/lu";
import { admin } from "@/lib/api";
import { qk } from "@/lib/queryClient";
import { useI18n } from "@/i18n";
import { useDebouncedValue, useDocumentTitle } from "@/hooks/useBooks";
import { useAdminAction, useAdminList } from "@/hooks/useAdmin";
import AdminTable, { AdminFilters, AdminPage, Cell } from "@/components/admin/AdminTable";
import { RequestStatus } from "@/components/requests/RequestCard";
import {
  Avatar,
  BookCover,
  Button,
  Drawer,
  Field,
  Input,
  Segmented,
  Select,
  Skeleton,
  Textarea,
  cn,
} from "@/ui";

const OPEN = ["open", "reviewing", "planned"];

/** Pick one item from a search (books to fulfil with, requests to merge into). */
const SearchPick = ({ label, fetcher, areaKey, render, onPick, picked }) => {
  const [text, setText] = useState("");
  const q = useDebouncedValue(text);
  const results = useQuery({
    queryKey: qk.admin(areaKey, { q }),
    queryFn: () => fetcher(q),
    enabled: q.trim().length >= 2,
    select: (d) => d?.results ?? [],
  });
  return (
    <div>
      <Field label={label}>
        <Input
          type="search"
          value={text}
          onChange={(e) => setText(e.target.value)}
          startIcon={<LuSearch />}
        />
      </Field>
      {results.data?.length ? (
        <ul className="mt-2 max-h-56 divide-y divide-line overflow-y-auto rounded-lg border border-line">
          {results.data.map((item) => (
            <li key={item._id}>
              <button
                type="button"
                onClick={() => onPick(item)}
                className={cn(
                  "flex w-full items-center gap-3 px-3 py-2 text-start hover:bg-sunken",
                  picked?._id === item._id && "bg-brand-soft",
                )}
              >
                {render(item)}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
};

const RequestPanel = ({ requestId, onClose }) => {
  const { t, date } = useI18n();
  const detail = useQuery({
    queryKey: qk.admin("bookRequest", requestId),
    queryFn: () => admin.bookRequest(requestId),
  });
  const r = detail.data;
  const [status, setStatus] = useState("");
  const [note, setNote] = useState("");
  const [book, setBook] = useState(null);
  const [into, setInto] = useState(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- start from the request's current status
    if (r) setStatus(r.status);
  }, [r]);

  const update = useAdminAction(
    () => admin.setRequestStatus(requestId, { status, note: note.trim() || undefined }),
    {
      alsoInvalidate: [["bookRequests"]],
      onSuccess: () => setNote(""),
    },
  );
  const fulfill = useAdminAction(
    () => admin.fulfillRequest(requestId, { bookId: book._id, note: note.trim() || undefined }),
    {
      alsoInvalidate: [["bookRequests"]],
      onSuccess: onClose,
    },
  );
  const merge = useAdminAction(() => admin.mergeRequest(requestId, into._id), {
    alsoInvalidate: [["bookRequests"]],
    onSuccess: onClose,
  });

  const isOpen = r && OPEN.includes(r.status);
  const rejecting = status === "rejected";

  return (
    <Drawer open onClose={onClose} title={r?.title ?? "…"} description={r?.author}>
      {!r ? (
        <Skeleton className="h-60 w-full" />
      ) : (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center gap-3">
            <RequestStatus status={r.status} />
            <span className="flex items-center gap-1.5 text-sm text-fg-muted">
              <LuUsers aria-hidden /> {t("requests.wanted", { count: r.followerCount })}
            </span>
            {r.isbn ? <span className="text-sm text-fg-subtle">ISBN {r.isbn}</span> : null}
          </div>

          {isOpen ? (
            <section className="space-y-3 rounded-lg border border-line p-4">
              <h3 className="font-semibold">{t("admin.req.setStatus")}</h3>
              <Select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                aria-label={t("admin.common.status")}
              >
                {["open", "reviewing", "planned", "rejected"].map((s) => (
                  <option key={s} value={s}>
                    {t(`requests.status.${s}`)}
                  </option>
                ))}
              </Select>
              <Field
                label={rejecting ? t("admin.req.statusNoteReject") : t("admin.req.statusNote")}
              >
                <Textarea
                  rows={2}
                  maxLength={1000}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </Field>
              <Button
                fullWidth
                variant={rejecting ? "danger" : "primary"}
                loading={update.isPending}
                disabled={(status === r.status && !note.trim()) || (rejecting && !note.trim())}
                onClick={() => update.mutate()}
              >
                {t("admin.req.update")}
              </Button>
            </section>
          ) : null}

          {isOpen ? (
            <section className="space-y-3 rounded-lg border border-success/30 bg-success-soft/40 p-4">
              <h3 className="font-semibold">{t("admin.req.fulfill")}</h3>
              <p className="text-sm text-fg-muted">{t("admin.req.fulfillHint")}</p>
              <SearchPick
                label={t("admin.req.findBook")}
                areaKey="pickBook"
                fetcher={(q) => admin.books({ search: q, status: "published", limit: 6 })}
                picked={book}
                onPick={setBook}
                render={(b) => (
                  <>
                    <BookCover
                      src={b.coverImage?.url}
                      title={b.title}
                      author={b.author}
                      size="xs"
                    />
                    <Cell title={b.title} sub={b.author} />
                  </>
                )}
              />
              <Button
                fullWidth
                disabled={!book}
                loading={fulfill.isPending}
                onClick={() => fulfill.mutate()}
              >
                {book ? `${t("admin.req.fulfill")}: ${book.title}` : t("admin.req.fulfill")}
              </Button>
            </section>
          ) : null}

          {isOpen ? (
            <section className="space-y-3 rounded-lg border border-line p-4">
              <h3 className="font-semibold">{t("admin.req.merge")}</h3>
              <p className="text-sm text-fg-muted">{t("admin.req.mergeHint")}</p>
              <SearchPick
                label={t("admin.req.findRequest")}
                areaKey="pickRequest"
                fetcher={(q) => admin.bookRequests({ search: q, limit: 6 })}
                picked={into}
                onPick={setInto}
                render={(x) => (
                  <Cell
                    title={x.title}
                    sub={`${x.author || ""} · ${t("requests.wanted", { count: x.followerCount })}`}
                  />
                )}
              />
              <Button
                fullWidth
                variant="secondary"
                disabled={!into || into._id === r._id}
                loading={merge.isPending}
                onClick={() => merge.mutate()}
              >
                {t("admin.req.mergeCta")}
              </Button>
            </section>
          ) : null}

          <section>
            <h3 className="mb-2 font-semibold">{t("admin.req.followers")}</h3>
            {r.followers?.length ? (
              <ul className="divide-y divide-line rounded-lg border border-line">
                {r.followers.map((f) => (
                  <li
                    key={f.user?._id ?? f.joinedAt}
                    className="flex items-start gap-3 px-3 py-2.5"
                  >
                    <Avatar name={f.user?.name} size="sm" />
                    <div className="min-w-0 flex-1">
                      <Cell title={f.user?.name ?? "—"} sub={f.user?.email} />
                      {f.note ? <p className="mt-1 text-sm text-fg-muted">“{f.note}”</p> : null}
                    </div>
                    <span className="shrink-0 text-xs text-fg-subtle">{date(f.joinedAt)}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-fg-subtle">{t("admin.req.noFollowers")}</p>
            )}
          </section>
        </div>
      )}
    </Drawer>
  );
};

/** /admin/requests */
const Requests = () => {
  const { t, relative } = useI18n();
  useDocumentTitle(t("admin.requests"));
  const list = useAdminList("bookRequests", admin.bookRequests, { status: "open" });
  const [open, setOpen] = useState(null);

  return (
    <AdminPage title={t("admin.requests")} description={t("admin.req.description")}>
      <AdminFilters>
        <Segmented
          label={t("admin.common.status")}
          value={list.params.status ?? ""}
          onChange={(v) => list.set({ status: v || undefined })}
          options={[
            ["open", t("admin.req.open")],
            ["reviewing", t("admin.req.reviewing")],
            ["planned", t("admin.req.planned")],
            ["fulfilled", t("admin.req.fulfilled")],
            ["", t("admin.common.all")],
          ]}
        />
      </AdminFilters>
      <AdminTable
        query={list.query}
        page={list.params.page}
        onPage={list.setPage}
        onRowClick={(r) => setOpen(r._id)}
        empty={t("admin.common.empty")}
        columns={[
          {
            key: "title",
            header: t("admin.common.book"),
            primary: true,
            cell: (r) => <Cell title={r.title} sub={r.author} />,
          },
          {
            key: "followers",
            header: t("admin.req.followers"),
            cell: (r) => <span className="font-semibold">{r.followerCount}</span>,
          },
          {
            key: "by",
            header: t("admin.req.requestedBy"),
            cell: (r) => <Cell title={r.requestedBy?.name ?? "—"} sub={r.requestedBy?.email} />,
          },
          {
            key: "status",
            header: t("admin.common.status"),
            cell: (r) => <RequestStatus status={r.status} />,
          },
          {
            key: "when",
            header: t("admin.common.created"),
            cell: (r) => <span className="text-fg-muted">{relative(r.createdAt)}</span>,
          },
        ]}
      />
      {open ? <RequestPanel key={open} requestId={open} onClose={() => setOpen(null)} /> : null}
    </AdminPage>
  );
};

export default Requests;
