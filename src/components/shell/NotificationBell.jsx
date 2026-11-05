import { Link, useNavigate } from "react-router-dom";
import { LuBell } from "react-icons/lu";
import { useAuth } from "@/context/AuthContext";
import { useI18n } from "@/i18n";
import { notificationLink } from "@/lib/notificationLink";
import {
  useMarkAllRead,
  useMarkRead,
  useNotificationList,
  useUnreadCount,
} from "@/hooks/useNotifications";
import { Button, IconButton, Popover, Skeleton, cn } from "@/ui";

/** Header bell: live unread badge + the latest notifications in a tray. */
const NotificationBell = () => {
  const { t, relative } = useI18n();
  const unread = useUnreadCount();
  const markAllRead = useMarkAllRead();

  return (
    <Popover
      width="w-[min(22rem,calc(100vw-2rem))]"
      trigger={(props) => (
        <IconButton
          {...props}
          label={unread ? t("notifications.unread", { count: unread }) : t("notifications.title")}
          icon={<LuBell />}
          badge={unread ? (unread > 99 ? "99+" : unread) : null}
        />
      )}
    >
      {({ close }) => (
        <Tray
          t={t}
          relative={relative}
          close={close}
          unread={unread}
          onMarkAll={() => markAllRead.mutate()}
          marking={markAllRead.isPending}
        />
      )}
    </Popover>
  );
};

const Tray = ({ t, relative, close, unread, onMarkAll, marking }) => {
  const { data, isLoading } = useNotificationList({ limit: 6 });
  const items = data?.results ?? [];
  const markRead = useMarkRead();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  return (
    <div>
      <div className="flex items-center justify-between border-b border-line px-4 py-3">
        <p className="font-semibold">{t("notifications.title")}</p>
        {unread ? (
          <Button variant="link" size="sm" onClick={onMarkAll} disabled={marking}>
            {t("notifications.markAllRead")}
          </Button>
        ) : null}
      </div>

      <ul className="max-h-96 overflow-y-auto py-1">
        {isLoading ? (
          [0, 1, 2].map((i) => (
            <li key={i} className="space-y-2 px-4 py-3">
              <Skeleton className="h-3.5 w-2/3" />
              <Skeleton className="h-3 w-full" />
            </li>
          ))
        ) : items.length === 0 ? (
          <li className="px-4 py-10 text-center text-sm text-fg-muted">
            {t("notifications.empty")}
          </li>
        ) : (
          items.map((n) => (
            <li key={n._id} className={cn("relative", !n.readAt && "bg-brand-soft/40")}>
              {!n.readAt ? (
                <span
                  className="absolute inset-s-1.5 top-4.5 size-1.5 rounded-full bg-brand"
                  aria-hidden
                />
              ) : null}
              <button
                type="button"
                onClick={() => {
                  if (!n.readAt) markRead.mutate([n._id]);
                  close();
                  const to = notificationLink(n, { isAdmin });
                  if (to) navigate(to);
                }}
                className="block w-full px-4 py-3 text-start hover:bg-sunken"
              >
                <span className="block text-sm font-medium text-fg">{n.title}</span>
                <span className="mt-0.5 line-clamp-2 block text-sm text-fg-muted">{n.message}</span>
                <span className="mt-1 block text-xs text-fg-subtle">{relative(n.createdAt)}</span>
              </button>
            </li>
          ))
        )}
      </ul>

      <div className="border-t border-line p-2">
        <Link
          to="/account/notifications"
          onClick={close}
          className="block rounded-lg px-3 py-2 text-center text-sm font-medium text-brand hover:bg-sunken"
        >
          {t("notifications.viewAll")}
        </Link>
      </div>
    </div>
  );
};

export default NotificationBell;
