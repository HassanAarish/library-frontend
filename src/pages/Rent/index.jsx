import { useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { LuArrowLeft, LuCalendarDays, LuTicket, LuWallet } from "react-icons/lu";
import { toast } from "react-toastify";
import { rentals } from "@/lib/api";
import { useI18n } from "@/i18n";
import { useAvailability, useBook, useDocumentTitle } from "@/hooks/useBooks";
import { useMyPackages } from "@/hooks/useRentals";
import {
  Alert,
  BookCover,
  Button,
  Card,
  Container,
  ErrorState,
  Field,
  Input,
  Skeleton,
  cn,
} from "@/ui";

const DAY = 86_400_000;
const MAX_AHEAD_DAYS = 60;

// <input type="date"> works in local dates (YYYY-MM-DD).
const toInputDate = (d) => {
  const x = new Date(d);
  return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, "0")}-${String(x.getDate()).padStart(2, "0")}`;
};

/** A big radio card. */
const Choice = ({
  name,
  value,
  checked,
  onChange,
  icon: Icon,
  title,
  hint,
  disabled,
  children,
}) => (
  <label
    className={cn(
      "flex cursor-pointer gap-3 rounded-lg border p-4 transition-colors",
      checked
        ? "border-brand bg-brand-soft/50 ring-1 ring-brand"
        : "border-line-strong hover:bg-sunken",
      disabled && "cursor-not-allowed opacity-55 hover:bg-transparent",
    )}
  >
    <input
      type="radio"
      name={name}
      value={value}
      checked={checked}
      onChange={() => onChange(value)}
      disabled={disabled}
      className="mt-1 accent-brand"
    />
    <span className="min-w-0 flex-1">
      <span className="flex items-center gap-2 font-medium text-fg">
        {Icon ? <Icon className="text-fg-subtle" aria-hidden /> : null} {title}
      </span>
      {hint ? <span className="mt-0.5 block text-sm text-fg-muted">{hint}</span> : null}
      {children}
    </span>
  </label>
);

/**
 * /books/:bookId/rent: choose when (earliest free slot or a date) and how to
 * pay (one rental, or a plan credit). Paid bookings continue to the payment
 * page; credit and free bookings are confirmed at once.
 */
const RentBook = () => {
  const { bookId } = useParams();
  const { t, price, date, dateTime } = useI18n();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const book = useBook(bookId);
  const availability = useAvailability(bookId);
  const packagesQ = useMyPackages();
  useDocumentTitle(book.data ? t("rent.title", { title: book.data.title }) : t("rent.eyebrow"));

  const [when, setWhen] = useState("earliest");
  const [startDate, setStartDate] = useState("");
  const [pay, setPay] = useState(null); // "single" | "credit"; null → default below

  const create = useMutation({
    mutationFn: rentals.create,
    onSuccess: ({ data, message }) => {
      queryClient.invalidateQueries({ queryKey: ["rentals"] });
      queryClient.invalidateQueries({ queryKey: ["packages"] });
      if (data.payment) {
        navigate(`/account/payments/${data.payment._id}`, { replace: true });
      } else {
        toast.success(message || t("rent.booked"));
        navigate("/account", { replace: true });
      }
    },
    onError: (err) => toast.error(err.message),
  });

  if (book.isLoading || availability.isLoading || packagesQ.isLoading) {
    return (
      <Container size="md" className="py-12">
        <Skeleton className="h-10 w-2/3" />
        <Skeleton className="mt-8 h-64 w-full" rounded="rounded-card" />
      </Container>
    );
  }
  if (book.isError) {
    return (
      <Container size="md" className="py-12">
        <ErrorState error={book.error} onRetry={book.refetch} />
      </Container>
    );
  }

  const b = book.data;
  const a = availability.data;
  // Already booked (e.g. opened this page again) → the library. Not while this
  // page's own booking is being created: the refreshed availability shows it
  // too, and onSuccess decides where to go (payment page or library).
  if (a?.myBooking && create.isIdle) return <Navigate to="/account" replace />;

  const credits = packagesQ.data?.creditsAvailable ?? 0;
  const free = b.price === 0;
  const payment = free ? "single" : (pay ?? (credits > 0 ? "credit" : "single"));

  const earliest = a?.nextAvailableStart ? new Date(a.nextAvailableStart) : new Date();
  const startsNow = when === "earliest" && a?.availableNow;
  const start = when === "date" && startDate ? new Date(`${startDate}T09:00:00`) : earliest;
  const end = new Date(start.getTime() + b.rentalDays * DAY);
  const today = new Date();
  const dateInvalid = when === "date" && !startDate;

  const submit = () =>
    create.mutate({
      bookId: b._id,
      paymentMethod: payment,
      // A chosen day starts at 09:00 Pakistan time; "earliest" (or today) lets
      // the server pick the first free moment.
      ...(when === "date" &&
        startDate &&
        startDate !== toInputDate(today) && { startDate: `${startDate}T09:00:00+05:00` }),
    });

  return (
    <Container size="lg" className="py-10 sm:py-14">
      <Link
        to={`/books/${b._id}`}
        className="mb-8 inline-flex items-center gap-2 text-sm text-fg-muted hover:text-fg"
      >
        <LuArrowLeft className="rtl:rotate-180" aria-hidden /> {b.title}
      </Link>
      <p className="mb-1 text-xs font-semibold tracking-[0.14em] text-gold uppercase">
        {t("rent.eyebrow")}
      </p>
      <h1 className="mb-8 text-3xl font-semibold text-balance sm:text-4xl">
        {t("rent.title", { title: b.title })}
      </h1>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="space-y-8">
          <section>
            <h2 className="mb-3 text-lg font-semibold">{t("rent.when")}</h2>
            <div className="space-y-3">
              <Choice
                name="when"
                value="earliest"
                checked={when === "earliest"}
                onChange={setWhen}
                icon={LuCalendarDays}
                title={t("rent.earliest")}
                hint={
                  a?.availableNow
                    ? t("rent.earliestNow")
                    : t("rent.earliestFrom", { date: dateTime(earliest) })
                }
              />
              <Choice
                name="when"
                value="date"
                checked={when === "date"}
                onChange={setWhen}
                icon={LuCalendarDays}
                title={t("rent.pickDate")}
                hint={t("rent.pickDateHint")}
              >
                {when === "date" ? (
                  <Field label={t("rent.startDate")} className="mt-3 max-w-xs">
                    <Input
                      type="date"
                      value={startDate}
                      min={toInputDate(today)}
                      max={toInputDate(today.getTime() + MAX_AHEAD_DAYS * DAY)}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </Field>
                ) : null}
              </Choice>
            </div>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold">{t("rent.howToPay")}</h2>
            {free ? (
              <Alert tone="success" title={t("rent.freeBook")} />
            ) : (
              <div className="space-y-3">
                <Choice
                  name="pay"
                  value="credit"
                  checked={payment === "credit"}
                  onChange={setPay}
                  disabled={credits === 0}
                  icon={LuTicket}
                  title={t("rent.useCredit")}
                  hint={credits ? t("rent.useCreditHint", { count: credits }) : t("rent.noCredits")}
                >
                  {credits === 0 ? (
                    <Link
                      to="/plans"
                      className="mt-1 inline-block text-sm font-medium text-brand hover:underline"
                    >
                      {t("rent.getPlan")} →
                    </Link>
                  ) : null}
                </Choice>
                <Choice
                  name="pay"
                  value="single"
                  checked={payment === "single"}
                  onChange={setPay}
                  icon={LuWallet}
                  title={t("rent.payOnce")}
                  hint={t("rent.payOnceHint", { price: price(b.price) })}
                />
              </div>
            )}
          </section>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <Card>
            <div className="flex gap-4">
              <BookCover src={b.coverImage?.url} title={b.title} author={b.author} size="sm" />
              <div className="min-w-0">
                <p className="line-clamp-2 font-serif font-semibold">{b.title}</p>
                <p className="truncate text-sm text-fg-muted">{b.author}</p>
              </div>
            </div>
            <dl className="mt-5 space-y-2 border-t border-line pt-4 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-fg-muted">{t("rent.days", { days: b.rentalDays })}</dt>
                <dd className="text-end text-fg">
                  {startsNow ? t("rent.earliestNow") : date(start)} → {date(end)}
                </dd>
              </div>
              <div className="flex justify-between gap-3 text-base font-semibold">
                <dt>{t("rent.total")}</dt>
                <dd>
                  {free
                    ? t("catalog.free")
                    : payment === "credit"
                      ? t("rent.viaCredit")
                      : price(b.price)}
                </dd>
              </div>
            </dl>
            {payment === "single" && !free ? (
              <p className="mt-3 text-xs text-fg-subtle">{t("rent.holdNote")}</p>
            ) : null}
            <Button
              className="mt-5"
              size="lg"
              fullWidth
              loading={create.isPending}
              disabled={dateInvalid}
              onClick={submit}
            >
              {payment === "single" && !free ? t("rent.confirmPay") : t("rent.confirm")}
            </Button>
          </Card>
        </aside>
      </div>
    </Container>
  );
};

export default RentBook;
