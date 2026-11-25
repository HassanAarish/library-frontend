import { useLocation } from "react-router-dom";
import { LuCalendarClock, LuCircleCheck, LuClock, LuUsers } from "react-icons/lu";
import { useAuth } from "@/context/AuthContext";
import { useI18n } from "@/i18n";
import { useAvailability } from "@/hooks/useBooks";
import { useSocket } from "@/realtime/SocketProvider";
import { Badge, Button, Card, Skeleton, cn } from "@/ui";

const BOOKING_TONE = {
  pending_payment: "warning",
  payment_review: "info",
  scheduled: "brand",
  active: "success",
};

const Row = ({ icon: Icon, children }) => (
  <li className="flex items-start gap-3 text-sm">
    <Icon className="mt-0.5 shrink-0 text-base text-fg-subtle" aria-hidden />
    <span className="text-fg-muted">{children}</span>
  </li>
);

/**
 * "Can I read this now?": free now, or rented until X, how many people are
 * ahead, and (signed in) your own booking and place in line. Live: refreshes
 * when anyone books or returns the book.
 */
const AvailabilityPanel = ({ book }) => {
  const { t, date, dateTime } = useI18n();
  const { isAuthenticated } = useAuth();
  const { connected } = useSocket();
  const location = useLocation();
  const { data, isLoading, isError, refetch } = useAvailability(book._id);

  const header = (
    <div className="mb-4 flex items-center justify-between">
      <h2 className="text-lg font-semibold">{t("availability.title")}</h2>
      {connected ? (
        <span className="flex items-center gap-1.5 text-xs text-fg-subtle">
          <span className="relative flex size-2">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-success opacity-60" />
            <span className="relative inline-flex size-2 rounded-full bg-success" />
          </span>
          {t("availability.live")}
        </span>
      ) : null}
    </div>
  );

  if (isLoading) {
    return (
      <Card>
        {header}
        <Skeleton className="h-6 w-2/3" />
        <Skeleton className="mt-3 h-4 w-full" />
        <Skeleton className="mt-2 h-4 w-4/5" />
        <Skeleton className="mt-6 h-11 w-full" rounded="rounded-xl" />
      </Card>
    );
  }

  if (isError || !data) {
    return (
      <Card>
        {header}
        <p className="text-sm text-fg-muted">{t("availability.error")}</p>
        <Button variant="secondary" size="sm" className="mt-3" onClick={() => refetch()}>
          {t("common.retry")}
        </Button>
      </Card>
    );
  }

  const mine = data.myBooking;
  const upcoming = data.bookedSlots.filter((s) => new Date(s.start) > new Date());

  let action;
  if (!isAuthenticated) {
    action = (
      <Button to="/login" state={{ from: location }} size="lg" fullWidth>
        {t("availability.signInToRent")}
      </Button>
    );
  } else if (mine) {
    action = (
      <Button to="/account/rentals" variant="secondary" size="lg" fullWidth>
        {t("availability.viewBooking")}
      </Button>
    );
  } else {
    action = (
      <Button to={`/books/${book._id}/rent`} size="lg" fullWidth>
        {data.availableNow
          ? t("availability.rentNow")
          : t("availability.bookNext", { date: date(data.nextAvailableStart) })}
      </Button>
    );
  }

  return (
    <Card>
      {header}

      {mine ? (
        <div className="mb-5 rounded-lg border border-brand/25 bg-brand-soft/60 p-4">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-semibold text-fg">{t("availability.yourBooking")}</p>
            <Badge tone={BOOKING_TONE[mine.status] || "neutral"} dot>
              {t(`availability.bookingStatus.${mine.status}`)}
            </Badge>
          </div>
          <p className="mt-1.5 text-sm text-fg-muted">
            {mine.placeInLine === 0
              ? t("availability.readingNow")
              : t("availability.placeInLine", { count: mine.placeInLine })}
          </p>
          <p className="mt-1 text-xs text-fg-subtle">
            {dateTime(mine.startDate)} → {dateTime(mine.endDate)}
          </p>
        </div>
      ) : null}

      <div
        className={cn(
          "flex items-center gap-2.5",
          data.availableNow ? "text-success" : "text-warning",
        )}
      >
        {data.availableNow ? <LuCircleCheck aria-hidden /> : <LuClock aria-hidden />}
        <p className="text-xl font-semibold">
          {data.availableNow ? t("availability.availableNow") : t("availability.rentedNow")}
        </p>
      </div>

      <ul className="mt-4 space-y-2.5">
        {data.availableNow ? (
          <Row icon={LuCalendarClock}>
            {t("availability.availableNowBody", { days: data.rentalDays })}
          </Row>
        ) : (
          <>
            {data.currentRentalEndsAt ? (
              <Row icon={LuCalendarClock}>
                {t("availability.rentedUntil", { date: dateTime(data.currentRentalEndsAt) })}
              </Row>
            ) : null}
            <Row icon={LuClock}>
              {t("availability.nextFree")}{" "}
              <strong className="font-semibold text-fg">{dateTime(data.nextAvailableStart)}</strong>
            </Row>
            {!mine ? (
              <Row icon={LuUsers}>
                {data.peopleAhead
                  ? t("availability.peopleAhead", { count: data.peopleAhead })
                  : t("availability.noOneAhead")}
              </Row>
            ) : null}
          </>
        )}
        {data.queueLength ? (
          <Row icon={LuUsers}>{t("availability.queue", { count: data.queueLength })}</Row>
        ) : null}
      </ul>

      <div className="mt-6">{action}</div>

      {upcoming.length ? (
        <details className="mt-5 text-sm">
          <summary className="cursor-pointer font-medium text-fg-muted hover:text-fg">
            {t("availability.bookedSlots")} ({upcoming.length})
          </summary>
          <ul className="mt-2 space-y-1 text-fg-subtle">
            {upcoming.map((s) => (
              <li key={s.start}>
                {date(s.start)} → {date(s.end)}
              </li>
            ))}
          </ul>
        </details>
      ) : null}
    </Card>
  );
};

export default AvailabilityPanel;
