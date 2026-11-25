import { useState } from "react";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { admin } from "@/lib/api";
import { qk } from "@/lib/queryClient";

/**
 * A paginated admin list with filters held in state:
 *   const list = useAdminList("payments", admin.payments, { status: "submitted" });
 *   list.query (React Query), list.params, list.set({ status }), list.setPage(n)
 * Changing a filter goes back to page 1. Live: admin socket events refresh ["admin"].
 */
export const useAdminList = (area, fetcher, initial = {}, { limit = 20 } = {}) => {
  const [params, setParams] = useState({ page: 1, limit, ...initial });
  const query = useQuery({
    queryKey: qk.admin(area, params),
    queryFn: () => fetcher(params),
    placeholderData: keepPreviousData,
  });
  return {
    query,
    params,
    set: (changes) => setParams((p) => ({ ...p, ...changes, page: 1 })),
    setPage: (page) => setParams((p) => ({ ...p, page })),
  };
};

export const useAdminStats = () =>
  useQuery({ queryKey: qk.admin("stats"), queryFn: admin.stats, refetchInterval: 60_000 });

/**
 * An admin action that shows the backend's message and refreshes admin data
 * (plus anything in `alsoInvalidate`).
 */
export const useAdminAction = (fn, { onSuccess, alsoInvalidate = [] } = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: (result, vars) => {
      if (result?.message) toast.success(result.message);
      queryClient.invalidateQueries({ queryKey: ["admin"] });
      alsoInvalidate.forEach((queryKey) => queryClient.invalidateQueries({ queryKey }));
      onSuccess?.(result, vars);
    },
    onError: (err) => toast.error(err.message),
  });
};
