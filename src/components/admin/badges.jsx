import { useI18n } from "@/i18n";
import { Badge } from "@/ui";

const PAYMENT_TONE = {
  awaiting_proof: "warning",
  submitted: "info",
  approved: "success",
  rejected: "danger",
  expired: "neutral",
  cancelled: "neutral",
};

const RENTAL_TONE = {
  pending_payment: "warning",
  payment_review: "info",
  scheduled: "brand",
  active: "success",
  completed: "neutral",
  cancelled: "neutral",
};

const BOOK_TONE = { draft: "warning", published: "success", archived: "neutral" };

/** Status badges shared by the admin screens (same words as the reader sees). */
export const PaymentBadge = ({ status }) => {
  const { t } = useI18n();
  return (
    <Badge tone={PAYMENT_TONE[status]} dot>
      {t(`payment.status.${status}`)}
    </Badge>
  );
};

export const RefundBadge = ({ status }) => {
  const { t } = useI18n();
  if (!status) return null;
  return (
    <Badge
      tone={status === "requested" ? "warning" : status === "refunded" ? "success" : "neutral"}
    >
      {t(`payment.refund.${status}`)}
    </Badge>
  );
};

export const RentalBadge = ({ status }) => {
  const { t } = useI18n();
  return (
    <Badge tone={RENTAL_TONE[status]} dot>
      {t(`library.status.${status}`)}
    </Badge>
  );
};

export const BookStatusBadge = ({ status }) => {
  const { t } = useI18n();
  return (
    <Badge tone={BOOK_TONE[status]} dot>
      {t(`admin.booksPage.${status}`)}
    </Badge>
  );
};
