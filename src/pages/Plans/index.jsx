import { Link, useLocation, useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { LuCheck, LuTicket } from "react-icons/lu";
import { toast } from "react-toastify";
import { packages } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useI18n } from "@/i18n";
import { useDocumentTitle } from "@/hooks/useBooks";
import { useMyPackages, usePlans } from "@/hooks/useRentals";
import {
  Alert,
  Badge,
  Button,
  Card,
  Container,
  EmptyState,
  ErrorState,
  PageHeader,
  Skeleton,
  cn,
} from "@/ui";

/** /plans: the 3/5/10-book yearly packages; buying one goes to its payment page. */
const Plans = () => {
  const { t, price, date } = useI18n();
  useDocumentTitle(t("plans.eyebrow"));
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const plans = usePlans();
  const mine = useMyPackages();

  const buy = useMutation({
    mutationFn: (planId) => packages.purchase(planId),
    onSuccess: ({ data }) => {
      queryClient.invalidateQueries({ queryKey: ["packages"] });
      navigate(`/account/payments/${data.payment._id}`);
    },
    onError: (err) => toast.error(err.message),
  });

  const list = plans.data ?? [];
  // The best value per book is highlighted.
  const best = list.reduce(
    (top, p) =>
      p.credits > 0 && (!top || p.price / p.credits < top.price / top.credits) ? p : top,
    null,
  );
  const pending = mine.data?.packages?.find((p) => p.status === "pending_payment");

  return (
    <Container size="xl" className="py-10 sm:py-14">
      <PageHeader
        eyebrow={t("plans.eyebrow")}
        title={t("plans.title")}
        description={t("plans.description")}
      />

      {isAuthenticated && mine.data ? (
        <div className="mb-8 space-y-3">
          {mine.data.creditsAvailable ? (
            <Alert
              tone="success"
              title={t("plans.yourCredits", { count: mine.data.creditsAvailable })}
            >
              {mine.data.nextExpiry
                ? t("plans.expiresOn", { date: date(mine.data.nextExpiry) })
                : null}
            </Alert>
          ) : null}
          {pending ? (
            <Alert
              tone="warning"
              title={t("plans.pendingPurchase")}
              action={
                <Button size="sm" to={`/account/payments/${pending.payment?._id}`}>
                  {t("plans.continuePayment")}
                </Button>
              }
            />
          ) : null}
        </div>
      ) : null}

      {plans.isError ? (
        <ErrorState error={plans.error} onRetry={plans.refetch} />
      ) : plans.isLoading ? (
        <div className="grid gap-6 md:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-80 w-full" rounded="rounded-card" />
          ))}
        </div>
      ) : list.length === 0 ? (
        <EmptyState icon={<LuTicket />} title={t("plans.empty")} />
      ) : (
        <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {list.map((plan) => {
            const highlight = best?._id === plan._id && list.length > 1;
            return (
              <li key={plan._id}>
                <Card
                  className={cn(
                    "relative flex h-full flex-col",
                    highlight && "border-brand ring-1 ring-brand",
                  )}
                >
                  {highlight ? (
                    <Badge tone="brand" className="absolute -top-3 inset-s-6">
                      {t("plans.bestValue")}
                    </Badge>
                  ) : null}
                  <h2 className="text-2xl font-semibold">{plan.name}</h2>
                  {plan.description ? (
                    <p className="mt-1 text-sm text-fg-muted">{plan.description}</p>
                  ) : null}
                  <p className="mt-6 font-serif text-4xl font-semibold">{price(plan.price)}</p>
                  <p className="mt-1 text-sm text-fg-muted">
                    {t("plans.perBook", { price: price(Math.round(plan.price / plan.credits)) })}
                  </p>
                  <ul className="mt-6 space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <LuCheck className="text-success" aria-hidden />
                      {t("plans.credits", { count: plan.credits })}
                    </li>
                    <li className="flex items-center gap-2">
                      <LuCheck className="text-success" aria-hidden />
                      {t("plans.validity", { days: plan.validityDays })}
                    </li>
                  </ul>
                  <div className="mt-auto pt-8">
                    {isAuthenticated ? (
                      <Button
                        fullWidth
                        size="lg"
                        variant={highlight ? "primary" : "secondary"}
                        loading={buy.isPending && buy.variables === plan._id}
                        disabled={Boolean(pending) || buy.isPending}
                        onClick={() => buy.mutate(plan._id)}
                      >
                        {t("plans.buy")}
                      </Button>
                    ) : (
                      <Button
                        fullWidth
                        size="lg"
                        variant="secondary"
                        to="/login"
                        state={{ from: location }}
                      >
                        {t("plans.signInToBuy")}
                      </Button>
                    )}
                  </div>
                </Card>
              </li>
            );
          })}
        </ul>
      )}

      <section className="mt-16 max-w-3xl">
        <h2 className="text-2xl font-semibold">{t("plans.howTitle")}</h2>
        <ul className="mt-4 space-y-2 text-fg-muted">
          {["plans.how1", "plans.how2", "plans.how3"].map((k) => (
            <li key={k} className="flex gap-2">
              <LuCheck className="mt-1 shrink-0 text-brand" aria-hidden /> {t(k)}
            </li>
          ))}
        </ul>
        <p className="mt-6 text-sm">
          <Link to="/books" className="font-medium text-brand hover:underline">
            {t("library.browse")} →
          </Link>
        </p>
      </section>
    </Container>
  );
};

export default Plans;
