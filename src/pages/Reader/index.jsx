import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  LuChevronLeft,
  LuChevronRight,
  LuLock,
  LuMinus,
  LuPlus,
  LuShieldAlert,
  LuX,
} from "react-icons/lu";
import { reader } from "@/lib/api";
import { useI18n } from "@/i18n";
import { useDocumentTitle } from "@/hooks/useBooks";
import ThemeToggle from "@/components/shell/ThemeToggle";
import { Button, EmptyState, IconButton, Spinner } from "@/ui";

const ZOOMS = [60, 75, 90, 100, 115, 130, 150];
const DEFAULT_ZOOM = 3; // 100% of the fit width

const lastPageKey = (bookId) => `reader:page:${bookId}`;
const readLastPage = (bookId) => {
  try {
    return Number(localStorage.getItem(lastPageKey(bookId))) || 1;
  } catch {
    return 1;
  }
};

/** One watermarked page as an object URL (revoked when no longer shown). */
const usePageImage = (bookId, page, enabled) => {
  const query = useQuery({
    queryKey: ["reader", bookId, page],
    queryFn: ({ signal }) => reader.page(bookId, page, { signal }),
    enabled: enabled && page > 0,
    staleTime: Infinity,
    gcTime: 2 * 60_000,
    retry: false,
  });
  const url = useMemo(() => (query.data ? URL.createObjectURL(query.data) : null), [query.data]);
  useEffect(() => () => url && URL.revokeObjectURL(url), [url]);
  return { ...query, url };
};

/**
 * /read/:bookId: full-screen page-by-page reader. Pages are watermarked by
 * the server for this reader and never offered as files; copying, dragging,
 * the context menu and printing are blocked here too.
 */
const Reader = () => {
  const { bookId } = useParams();
  const { t, dateTime } = useI18n();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const book = useQuery({
    queryKey: ["reader", bookId, "open"],
    queryFn: () => reader.open(bookId),
    retry: false,
  });
  useDocumentTitle(book.data?.title);

  const total = book.data?.pageCount ?? 0;
  const [page, setPage] = useState(() => readLastPage(bookId));
  const [zoom, setZoom] = useState(DEFAULT_ZOOM);
  const current = Math.min(Math.max(page, 1), total || 1);

  const image = usePageImage(bookId, current, book.isSuccess);

  // Keep the next page ready (one ahead; the server limits pages per minute).
  useEffect(() => {
    if (!book.isSuccess || current >= total || image.isError) return;
    queryClient.prefetchQuery({
      queryKey: ["reader", bookId, current + 1],
      queryFn: ({ signal }) => reader.page(bookId, current + 1, { signal }),
      staleTime: Infinity,
      retry: false,
    });
  }, [book.isSuccess, bookId, current, total, image.isError, queryClient]);

  useEffect(() => {
    try {
      localStorage.setItem(lastPageKey(bookId), String(current));
    } catch {
      // ignore
    }
  }, [bookId, current]);

  const go = useCallback(
    (next) => {
      if (!total) return;
      setPage(Math.min(Math.max(next, 1), total));
      window.scrollTo({ top: 0 });
    },
    [total],
  );

  useEffect(() => {
    const onKey = (e) => {
      if (e.target instanceof HTMLInputElement) return;
      const rtl = document.documentElement.dir === "rtl";
      if (e.key === "ArrowRight" || e.key === "PageDown") go(current + (rtl ? -1 : 1));
      if (e.key === "ArrowLeft" || e.key === "PageUp") go(current + (rtl ? 1 : -1));
      // Block print / save shortcuts while reading.
      if ((e.ctrlKey || e.metaKey) && ["p", "s"].includes(e.key.toLowerCase())) e.preventDefault();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [current, go]);

  const close = () => navigate("/account");

  if (book.isLoading) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4 text-fg-muted">
        <Spinner size="lg" className="text-brand" />
        {t("reader.loading")}
      </div>
    );
  }

  if (book.isError) {
    return (
      <div className="flex min-h-dvh items-center justify-center px-4">
        <EmptyState
          icon={<LuLock />}
          title={t("reader.noAccessTitle")}
          description={book.error?.status === 403 ? t("reader.noAccessBody") : book.error?.message}
          action={
            <div className="flex flex-wrap justify-center gap-2">
              <Button variant="secondary" to="/account">
                {t("library.eyebrow")}
              </Button>
              <Button to={`/books/${bookId}`}>{t("availability.rentNow")}</Button>
            </div>
          }
          className="max-w-lg bg-surface"
        />
      </div>
    );
  }

  const tooFast = image.error?.status === 429;

  return (
    <div
      className="reader-protect flex min-h-dvh flex-col bg-sunken select-none"
      onContextMenu={(e) => e.preventDefault()}
      onCopy={(e) => e.preventDefault()}
      onDragStart={(e) => e.preventDefault()}
    >
      <header className="sticky top-0 z-30 border-b border-line bg-surface/95 backdrop-blur-sm">
        <div className="flex h-14 items-center gap-2 px-2 sm:px-4">
          <IconButton label={t("reader.close")} icon={<LuX />} onClick={close} />
          <div className="min-w-0 flex-1">
            <p className="truncate font-serif text-sm font-semibold sm:text-base">
              {book.data.title}
            </p>
            <p className="hidden truncate text-xs text-fg-subtle sm:block">
              {book.data.author}
              {book.data.accessUntil
                ? ` · ${t("reader.accessUntil", { date: dateTime(book.data.accessUntil) })}`
                : ""}
            </p>
          </div>
          <div className="hidden items-center gap-1 sm:flex">
            <IconButton
              label={t("reader.zoomOut")}
              icon={<LuMinus />}
              onClick={() => setZoom((z) => Math.max(0, z - 1))}
              disabled={zoom === 0}
            />
            <button
              type="button"
              onClick={() => setZoom(DEFAULT_ZOOM)}
              title={t("reader.fit")}
              className="w-12 rounded-md py-1 text-center text-xs font-medium text-fg-muted hover:bg-sunken"
            >
              {ZOOMS[zoom]}%
            </button>
            <IconButton
              label={t("reader.zoomIn")}
              icon={<LuPlus />}
              onClick={() => setZoom((z) => Math.min(ZOOMS.length - 1, z + 1))}
              disabled={zoom === ZOOMS.length - 1}
            />
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main
        id="main"
        className="flex flex-1 justify-center overflow-x-auto px-2 py-4 sm:px-6 sm:py-8"
      >
        <div
          className="relative mx-auto w-full"
          style={{ maxWidth: `${(ZOOMS[zoom] / 100) * 48}rem` }}
        >
          {image.url ? (
            <img
              src={image.url}
              alt={t("reader.page", { page: current, total })}
              draggable={false}
              className="pointer-events-none w-full rounded-sm bg-white shadow-pop"
            />
          ) : (
            <div className="flex aspect-[1/1.414] w-full items-center justify-center rounded-sm bg-surface shadow-card">
              {image.isError ? (
                <div className="max-w-xs px-6 text-center text-sm text-fg-muted">
                  <LuShieldAlert className="mx-auto mb-2 text-2xl text-warning" aria-hidden />
                  {tooFast ? t("reader.tooFast") : t("reader.pageError")}
                  <Button
                    variant="secondary"
                    size="sm"
                    className="mt-3"
                    onClick={() => image.refetch()}
                  >
                    {t("common.retry")}
                  </Button>
                </div>
              ) : (
                <Spinner size="lg" className="text-fg-subtle" />
              )}
            </div>
          )}
        </div>
      </main>

      <footer className="sticky bottom-0 z-30 border-t border-line bg-surface/95 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between gap-3 px-3">
          <Button
            variant="secondary"
            icon={<LuChevronLeft className="rtl:rotate-180" aria-hidden />}
            onClick={() => go(current - 1)}
            disabled={current <= 1}
            aria-label={t("reader.previous")}
          >
            <span className="hidden sm:inline">{t("common.previous")}</span>
          </Button>
          <form
            className="flex items-center gap-2 text-sm text-fg-muted"
            onSubmit={(e) => {
              e.preventDefault();
              go(Number(new FormData(e.currentTarget).get("page")));
            }}
          >
            <label htmlFor="reader-page" className="sr-only">
              {t("reader.pageLabel")}
            </label>
            <input
              key={current}
              id="reader-page"
              name="page"
              type="number"
              min={1}
              max={total}
              defaultValue={current}
              className="h-9 w-16 rounded-md border border-line-strong bg-surface text-center text-fg"
            />
            <span>/ {total}</span>
          </form>
          <Button
            variant="secondary"
            iconEnd={<LuChevronRight className="rtl:rotate-180" aria-hidden />}
            onClick={() => go(current + 1)}
            disabled={current >= total}
            aria-label={t("reader.next")}
          >
            <span className="hidden sm:inline">{t("common.next")}</span>
          </Button>
        </div>
        <p className="hidden pb-2 text-center text-[11px] text-fg-subtle sm:block">
          {t("reader.protectedNote")}{" "}
          <Link to="/terms" className="underline">
            {t("footer.terms")}
          </Link>
        </p>
      </footer>
    </div>
  );
};

export default Reader;
