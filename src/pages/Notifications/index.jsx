import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { LuBellOff, LuCheck, LuChevronRight, LuTrash2 } from "react-icons/lu";
import { toast } from "react-toastify";
import { notifications } from "@/lib/api";
import { qk } from "@/lib/queryClient";
import { notificationLink } from "@/lib/notificationLink";
import { useAuth } from "@/context/AuthContext";
import { useI18n } from "@/i18n";
import { useMarkAllRead, useMarkRead, useNotificationList } from "@/hooks/useNotifications";
import AccountPage from "@/components/account/AccountPage";
import { Button, Card, EmptyState, ErrorState, IconButton, Pagination, Skeleton, cn } from "@/ui";

/** /account/notifications: the full inbox (all / unread), open, mark read, delete. */
const Notifications = () => {
  const { t, relative, dateTime } = useI18n();
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);

  const params = { page, limit: 20, ...(filter === "unread" && { unread: "true" }) };
  const { data, isLoading, isError, error, refetch } = useNotificationList(params);
  const markAll = useMarkAllRead();
  const markRead = useMarkRead();
  const remove = useMutation({
    mutationFn: notifications.remove,
    onSuccess: ({ unreadCount }) => {
      queryClient.setQueryData(qk.unreadCount, { unreadCount });
      queryClient.invalidateQueries({ queryKey: ["notifications", "list"] });
    },
    onError: (err) => toast.error(err.message),
  });

  const list = data?.results ?? [];

  const open = (n) => {
    if (!n.readAt) markRead.mutate([n._id]);
    const to = notificationLink(n, { isAdmin });
    if (to) navigate(to);
  };

  const tab = (value, label) => (
    <button
      type="button"
      onClick={() => {
        setFilter(value);
        setPage(1);
      }}
      aria-pressed={filter === value}
      className={cn(
        "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
        filter === value ? "bg-fg text-canvas" : "text-fg-muted hover:bg-sunken hover:text-fg",
      )}
    >
      {label}
    </button>
  );

  return (
    <AccountPage title={t("inbox.title")} description={t("inbox.description")}>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-1 rounded-xl border border-line bg-surface p-1">
          {tab("all", t("inbox.all"))}
          {tab("unread", t("inbox.unread"))}
        </div>
        {data?.unreadCount ? (
          <Button
            variant="ghost"
            size="sm"
            icon={<LuCheck aria-hidden />}
            loading={markAll.isPending}
            onClick={() => markAll.mutate()}
          >
            {t("inbox.markAllRead")}
          </Button>
        ) : null}
      </div>

      {isError ? (
        <ErrorState error={error} onRetry={refetch} />
      ) : isLoading ? (
        <div className="space-y-2">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 w-full" rounded="rounded-card" />
          ))}
        </div>
      ) : list.length === 0 ? (
        <EmptyState
          icon={<LuBellOff />}
          title={filter === "unread" ? t("inbox.emptyUnread") : t("inbox.empty")}
        />
      ) : (
        <>
          <Card as="ul" padded={false} className="divide-y divide-line overflow-hidden">
            {list.map((n) => {
              const to = notificationLink(n, { isAdmin });
              return (
                <li
                  key={n._id}
                  className={cn(
                    "group relative flex items-start gap-3 p-4 sm:p-5",
                    !n.readAt && "bg-brand-soft/40",
                  )}
                >
                  <span
                    aria-hidden
                    className={cn(
                      "mt-2 size-2 shrink-0 rounded-full",
                      n.readAt ? "bg-transparent" : "bg-brand",
                    )}
                  />
                  <button
                    type="button"
                    onClick={() => open(n)}
                    className="min-w-0 flex-1 text-start"
                    disabled={!to && Boolean(n.readAt)}
                  >
                    <p className={cn("text-sm text-fg", !n.readAt && "font-semibold")}>{n.title}</p>
                    <p className="mt-0.5 text-sm text-fg-muted">{n.message}</p>
                    <p className="mt-1 text-xs text-fg-subtle" title={dateTime(n.createdAt)}>
                      {relative(n.createdAt)}
                    </p>
                  </button>
                  <div className="flex shrink-0 items-center gap-1">
                    {!n.readAt ? (
                      <IconButton
                        size="sm"
                        label={t("inbox.markRead")}
                        icon={<LuCheck />}
                        onClick={() => markRead.mutate([n._id])}
                      />
                    ) : null}
                    <IconButton
                      size="sm"
                      label={t("inbox.delete")}
                      icon={<LuTrash2 />}
                      onClick={() => remove.mutate(n._id)}
                      className="hover:text-danger"
                    />
                    {to ? (
                      <LuChevronRight className="text-fg-subtle rtl:rotate-180" aria-hidden />
                    ) : null}
                  </div>
                </li>
              );
            })}
          </Card>
          <Pagination page={page} totalPages={data?.totalPages} onChange={setPage} />
        </>
      )}
    </AccountPage>
  );
};

export default Notifications;
