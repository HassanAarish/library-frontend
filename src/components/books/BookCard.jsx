import { Link } from "react-router-dom";
import { useI18n } from "@/i18n";
import { BookCover, Skeleton, cn } from "@/ui";

/** Catalogue tile: cover, title, author, price per rental. The whole card is the link. */
const BookCard = ({ book, className }) => {
  const { t, price } = useI18n();
  const cost = book.price === 0 ? t("catalog.free") : price(book.price);

  return (
    <Link
      to={`/books/${book._id}`}
      className={cn("group flex flex-col rounded-card focus-visible:outline-offset-4", className)}
    >
      <BookCover
        src={book.coverImage?.url}
        title={book.title}
        author={book.author}
        size="fill"
        className="transition-transform duration-200 group-hover:-translate-y-1 group-hover:shadow-pop"
      />
      <div className="mt-3 min-w-0">
        <h3 className="line-clamp-2 font-serif text-base/snug font-semibold text-fg group-hover:text-brand">
          {book.title}
        </h3>
        <p className="mt-0.5 truncate text-sm text-fg-muted">{book.author}</p>
        <p className="mt-1.5 text-sm font-medium text-fg">
          {t("catalog.perRental", { price: cost, days: book.rentalDays })}
        </p>
      </div>
    </Link>
  );
};

export const BookCardSkeleton = () => (
  <div aria-hidden>
    <Skeleton className="aspect-2/3 w-full" rounded="rounded-[3px_6px_6px_3px]" />
    <Skeleton className="mt-3 h-4 w-4/5" />
    <Skeleton className="mt-2 h-3.5 w-1/2" />
    <Skeleton className="mt-2 h-3.5 w-2/5" />
  </div>
);

const GRID = "grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5";

/** Responsive grid of book cards, with placeholders while loading. */
export const BookGrid = ({ books, loading, skeletons = 10, className }) => (
  <ul className={cn(GRID, className)} aria-busy={loading || undefined}>
    {loading
      ? Array.from({ length: skeletons }, (_, i) => (
          <li key={i}>
            <BookCardSkeleton />
          </li>
        ))
      : books.map((book) => (
          <li key={book._id}>
            <BookCard book={book} />
          </li>
        ))}
  </ul>
);

export default BookCard;
