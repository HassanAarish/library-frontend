import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { io } from "socket.io-client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { socketURL } from "@/constants";
import { useAuth } from "@/context/AuthContext";
import { useI18n } from "@/i18n";
import { qk } from "@/lib/queryClient";
import { sessionFlags } from "@/lib/sessionFlags";

/**
 * One Socket.IO connection for the whole app (anonymous for visitors, with
 * the token once signed in; it reconnects when the session changes).
 *
 * Server events carry ids only; we turn them into cache invalidations so
 * React Query refetches exactly what changed:
 *   notification:new   → toast + inbox/unread refresh (+ the area it's about)
 *   notification:read  → unread count from another tab
 *   book:availability  → that book's availability (queue, place in line)
 *   account:blocked    → sign out
 *   account:closed     → sign out (the account was closed for deletion)
 */
const SocketContext = createContext(null);

// Which cached data a notification type makes stale.
const STALE_BY_TYPE = {
  payment: [["payments"], ["rentals"], ["packages"]],
  refund: [["payments"]],
  rental: [["rentals"]],
  package: [["packages"]],
  book_request: [["bookRequests"]],
  category: [["categories"]],
};

export const SocketProvider = ({ children }) => {
  const queryClient = useQueryClient();
  const { token, status, signOut } = useAuth();
  const { t } = useI18n();
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (status === "loading") return undefined;

    const s = io(socketURL, {
      auth: token ? { token } : {},
      transports: ["websocket", "polling"],
      reconnectionDelayMax: 10_000,
    });
    // eslint-disable-next-line react-hooks/set-state-in-effect -- the socket is an external resource
    setSocket(s);

    s.on("connect", () => setConnected(true));
    s.on("disconnect", () => setConnected(false));
    s.on("connect_error", (err) => {
      setConnected(false);
      // A refused token (expired, password changed, blocked) ends the session.
      if (token && /expired|suspended|Not authorized|no longer exists/i.test(err.message)) {
        toast.info(
          /suspended/i.test(err.message) ? t("account.blocked") : t("account.sessionExpired"),
        );
        signOut();
      }
    });

    s.on("notification:new", (n) => {
      toast(n.title, { toastId: n._id });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      const area = n.type?.split(".")[0];
      (STALE_BY_TYPE[area] || []).forEach((queryKey) =>
        queryClient.invalidateQueries({ queryKey }),
      );
    });

    s.on("notification:read", ({ unreadCount }) => {
      if (typeof unreadCount === "number") {
        queryClient.setQueryData(qk.unreadCount, { unreadCount });
      }
      queryClient.invalidateQueries({ queryKey: ["notifications", "list"] });
    });

    s.on("book:availability", ({ bookId }) => {
      queryClient.invalidateQueries({ queryKey: qk.availability(bookId) });
    });

    // Admin dashboards refresh their queues live.
    s.on("admin:activity", () => {
      queryClient.invalidateQueries({ queryKey: ["admin"] });
    });

    s.on("account:blocked", () => {
      toast.error(t("account.blocked"));
      signOut();
    });

    s.on("account:closed", () => {
      if (sessionFlags.closingAccount) return; // deleted in this tab: that dialog signs out
      toast.info(t("account.closed"));
      signOut();
    });

    return () => {
      s.removeAllListeners();
      s.close();
      setConnected(false);
    };
  }, [token, status, queryClient, signOut, t]);

  const value = useMemo(() => ({ socket, connected }), [socket, connected]);

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useSocket = () => useContext(SocketContext) ?? { socket: null, connected: false };

/**
 * Live availability for a book page: joins the book's room while mounted, so
 * "rented / free from / people ahead" refreshes when anyone books or returns it.
 * Re-joins after a reconnect.
 */
// eslint-disable-next-line react-refresh/only-export-components
export const useWatchBook = (bookId) => {
  const { socket } = useSocket();

  useEffect(() => {
    if (!socket || !bookId) return undefined;
    const join = () => socket.emit("book:watch", String(bookId));
    if (socket.connected) join();
    socket.on("connect", join);
    return () => {
      socket.off("connect", join);
      socket.emit("book:unwatch", String(bookId));
    };
  }, [socket, bookId]);
};
