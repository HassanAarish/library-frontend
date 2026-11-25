import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { bookRequests, categories, lookup } from "@/lib/api";
import { qk } from "@/lib/queryClient";
import { useAuth } from "@/context/AuthContext";
import { useI18n } from "@/i18n";

/** Public list of requests (signed-in viewers also get `following`). */
export const useBookRequests = (params) => {
  const { status, user } = useAuth();
  return useQuery({
    queryKey: [...qk.bookRequests(params), user?._id ?? "guest"],
    queryFn: () => bookRequests.list(params),
    placeholderData: keepPreviousData,
    enabled: status !== "loading",
  });
};

export const useBookRequest = (requestId) => {
  const { status, user } = useAuth();
  return useQuery({
    queryKey: [...qk.bookRequest(requestId), user?._id ?? "guest"],
    queryFn: () => bookRequests.get(requestId),
    enabled: Boolean(requestId) && status !== "loading",
  });
};

export const useMyBookRequests = (params) =>
  useQuery({ queryKey: qk.myBookRequests(params), queryFn: () => bookRequests.mine(params) });

export const useMyCategorySuggestions = () =>
  useQuery({
    queryKey: qk.myCategories,
    queryFn: () => categories.mine({ limit: 50 }),
    select: (data) => data?.results ?? [],
  });

/** Follow / unfollow a request ("I want this too"). */
export const useFollowRequest = () => {
  const queryClient = useQueryClient();
  const { t } = useI18n();
  return useMutation({
    mutationFn: ({ request, follow }) =>
      follow ? bookRequests.follow(request._id) : bookRequests.unfollow(request._id),
    onSuccess: (_, { follow }) => {
      toast.success(follow ? t("requests.followed") : t("requests.unfollowed"));
      queryClient.invalidateQueries({ queryKey: ["bookRequests"] });
    },
    onError: (err) => toast.error(err.message),
  });
};

/** Open Library suggestions while typing (signed in; debounce the query first). */
export const useBookLookup = (q) => {
  const { isAuthenticated } = useAuth();
  const text = q.trim();
  return useQuery({
    queryKey: ["lookup", text.toLowerCase()],
    queryFn: () => lookup.search({ q: text, limit: 6 }),
    enabled: isAuthenticated && text.length >= 3,
    staleTime: 60 * 60_000,
    retry: false,
  });
};
