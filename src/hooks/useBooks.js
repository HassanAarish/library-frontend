import { useEffect, useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { books, categories, rentals } from "@/lib/api";
import { qk } from "@/lib/queryClient";
import { useAuth } from "@/context/AuthContext";
import { useWatchBook } from "@/realtime/SocketProvider";
import { useSeo } from "./useSeo";

/** Catalogue page: keeps the previous page on screen while the next loads. */
export const useCatalog = (params) =>
  useQuery({
    queryKey: qk.catalog(params),
    queryFn: () => books.catalog(params),
    placeholderData: keepPreviousData,
  });

export const useBook = (bookId) =>
  useQuery({
    queryKey: qk.book(bookId),
    queryFn: () => books.get(bookId),
    enabled: Boolean(bookId),
    staleTime: 5 * 60_000,
  });

/** Approved categories for filters (they change rarely). */
export const useCategories = () =>
  useQuery({
    queryKey: qk.categories({ limit: 100 }),
    queryFn: () => categories.list({ limit: 100 }),
    select: (data) => data?.results ?? [],
    staleTime: 10 * 60_000,
  });

/**
 * A book's live availability: refetched whenever anyone books, cancels or
 * returns it (socket), and personalised (place in line) when signed in.
 */
export const useAvailability = (bookId) => {
  const { status, user } = useAuth();
  useWatchBook(bookId);
  return useQuery({
    // The user id is part of the key: the answer differs per viewer.
    queryKey: [...qk.availability(bookId), user?._id ?? "guest"],
    queryFn: () => rentals.availability(bookId),
    enabled: Boolean(bookId) && status !== "loading",
    staleTime: 15_000,
  });
};

/** `value`, but only after it stopped changing for `delay` ms (search boxes). */
export const useDebouncedValue = (value, delay = 350) => {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
};

/** Sets the tab title ("Title · LibraryHub") and the default SEO tags; see useSeo for more. */
export const useDocumentTitle = (title) => useSeo({ title });
