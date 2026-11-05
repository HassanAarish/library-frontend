import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { notifications } from "@/lib/api";
import { qk } from "@/lib/queryClient";
import { useAuth } from "@/context/AuthContext";

/** Unread badge count. Live: the socket refreshes it on every new notification. */
export const useUnreadCount = () => {
  const { isAuthenticated } = useAuth();
  const query = useQuery({
    queryKey: qk.unreadCount,
    queryFn: notifications.unreadCount,
    enabled: isAuthenticated,
    staleTime: 60_000,
  });
  return query.data?.unreadCount ?? 0;
};

/** A page of the inbox (newest first). `params`: { unread, type, page, limit } */
export const useNotificationList = (params = { limit: 8 }, { enabled = true } = {}) => {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: qk.notifications(params),
    queryFn: () => notifications.list(params),
    enabled: isAuthenticated && enabled,
  });
};

export const useMarkAllRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: notifications.markAllRead,
    onSuccess: ({ unreadCount }) => {
      queryClient.setQueryData(qk.unreadCount, { unreadCount });
      queryClient.invalidateQueries({ queryKey: ["notifications", "list"] });
    },
  });
};

export const useMarkRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ids) => notifications.markRead(ids),
    onSuccess: ({ unreadCount }) => {
      queryClient.setQueryData(qk.unreadCount, { unreadCount });
      queryClient.invalidateQueries({ queryKey: ["notifications", "list"] });
    },
  });
};
