import { Link, useParams } from "react-router-dom";
import { LuArrowLeft, LuMonitorSmartphone } from "react-icons/lu";
import { useI18n } from "@/i18n";
import { useBook, useDocumentTitle } from "@/hooks/useBooks";
import AvailabilityPanel from "@/components/books/AvailabilityPanel";
import { Badge, BookCover, Button, Card, Container, EmptyState, ErrorState, Skeleton } from "@/ui";

const Fact = ({ label, value }) =>
  value ? (
    <div>
      <dt className="text-xs font-medium tracking-wide text-fg-subtle uppercase">{label}</dt>
      <dd className="mt-0.5 text-sm text-fg">{value}</dd>
    </div>
  ) : null;

const DetailSkeleton = () => (
  <div className="grid gap-10 lg:grid-cols-[16rem_1fr_22rem]" aria-hidden>
    <Skeleton className="aspect-2/3 w-48 lg:w-full" rounded="rounded-[3px_6px_6px_3px]" />
    <div>
      <Skeleton className="h-10 w-3/4" />
      <Skeleton className="mt-3 h-5 w-1/3" />
      <Skeleton className="mt-8 h-4 w-full" />
      <Skeleton className="mt-2 h-4 w-full" />
      <Skeleton className="mt-2 h-4 w-2/3" />
    </div>
    <Skeleton className="h-72 w-full" rounded="rounded-card" />
  </div>
);

/** One book: cover and details, price, and live availability with the queue. */
const BookDetail = () => {
  const { bookId } = useParams();
  const { t, price } = useI18n();
  const { data: book, isLoading, isError, error, refetch } = useBook(bookId);
  useDocumentTitle(book?.title);

  const back = (
    <Link
      to="/books"
      className="mb-8 inline-flex items-center gap-2 text-sm text-fg-muted hover:text-fg"
    >
      <LuArrowLeft className="rtl:rotate-180" aria-hidden /> {t("book.back")}
    </Link>
  );

  if (isLoading) {
    return (
      <Container size="xl" className="py-10">
        {back}
        <DetailSkeleton />
      </Container>
    );
  }

  if (isError) {
    return (
      <Container size="md" className="py-16">
        {back}
        {error?.status === 404 ? (
          <EmptyState
            title={t("book.notFoundTitle")}
            description={t("book.notFoundBody")}
            action={<Button to="/books">{t("book.back")}</Button>}
          />
        ) : (
          <ErrorState error={error} onRetry={refetch} />
        )}
      </Container>
    );
  }

  return (
    <Container size="xl" className="py-10">
      {back}

      <div className="grid gap-10 lg:grid-cols-[16rem_1fr_22rem] lg:gap-12">
        <div className="flex justify-center lg:block">
          <BookCover
            src={book.coverImage?.url}
            title={book.title}
            author={book.author}
            size="fill"
            loading="eager"
            className="w-48 sm:w-56 lg:w-full"
          />
        </div>

        <div className="min-w-0">
          {book.category?.name ? (
            <Badge tone="gold" className="mb-3">
              {book.category.name}
            </Badge>
          ) : null}
          <h1 className="text-3xl/tight font-semibold text-balance sm:text-4xl">{book.title}</h1>
          <p className="mt-2 text-lg text-fg-muted">{t("book.by", { author: book.author })}</p>

          <div className="mt-6 flex flex-wrap items-baseline gap-x-4 gap-y-1">
            <p className="font-serif text-3xl font-semibold text-fg">
              {book.price === 0 ? t("catalog.free") : price(book.price)}
            </p>
            <p className="text-sm text-fg-muted">
              {t("book.rentalLength", { days: book.rentalDays })} · {t("book.orCredit")}{" "}
              <Link to="/plans" className="font-medium text-brand hover:underline">
                {t("book.seePlans")}
              </Link>
            </p>
          </div>

          <section className="mt-10">
            <h2 className="text-xl font-semibold">{t("book.about")}</h2>
            <div className="mt-3 max-w-prose leading-relaxed whitespace-pre-line text-fg-muted">
              {book.description || t("book.noDescription")}
            </div>
          </section>

          <section className="mt-10">
            <h2 className="sr-only">{t("book.details")}</h2>
            <dl className="grid grid-cols-2 gap-x-6 gap-y-4 rounded-card border border-line bg-surface p-5 sm:grid-cols-4">
              <Fact label={t("book.language")} value={book.language} />
              <Fact label={t("book.pages")} value={book.pageCount} />
              <Fact label={t("book.published")} value={book.publishedYear} />
              <Fact label={t("book.isbn")} value={book.isbn} />
            </dl>
          </section>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <AvailabilityPanel book={book} />
          <Card padded={false} className="mt-4 flex items-start gap-3 p-4 text-sm text-fg-muted">
            <LuMonitorSmartphone className="mt-0.5 shrink-0 text-base text-brand" aria-hidden />
            {t("book.readOnlyNote")}
          </Card>
        </aside>
      </div>
    </Container>
  );
};

export default BookDetail;
