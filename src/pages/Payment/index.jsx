import { useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useFormik } from "formik";
import { LuCircleCheck, LuCircleX, LuClock, LuHourglass, LuImagePlus } from "react-icons/lu";
import { toast } from "react-toastify";
import * as Yup from "yup";
import { payments, rentals } from "@/lib/api";
import { qk } from "@/lib/queryClient";
import { useI18n } from "@/i18n";
import { useDocumentTitle } from "@/hooks/useBooks";
import { usePayment } from "@/hooks/useRentals";
import { CopyValue } from "@/components/account/bits";
import { useCountdown } from "@/hooks/useCountdown";
import { fieldError } from "@/pages/Auth/forms";
import {
  Alert,
  Badge,
  BookCover,
  Button,
  Card,
  Container,
  ErrorState,
  Field,
  Input,
  Skeleton,
  Spinner,
} from "@/ui";

const STATUS_TONE = {
  awaiting_proof: "warning",
  submitted: "info",
  approved: "success",
  rejected: "danger",
  expired: "neutral",
  cancelled: "neutral",
};

const PHONE = /^(\+92|92|0)3\d{2}[\s-]?\d{7}$/;

/** Step 2: TID + sender number + private receipt screenshot. */
const ProofForm = ({ payment }) => {
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const fileRef = useRef(null);
  const [shot, setShot] = useState(null); // { public_id, name, preview }

  const upload = useMutation({
    mutationFn: (file) => payments.uploadProof(file),
    onSuccess: (data, file) => setShot({ ...data, preview: URL.createObjectURL(file) }),
    onError: (err) => toast.error(err.message),
  });

  const submit = useMutation({
    mutationFn: (values) =>
      payments.submitProof(payment._id, {
        transactionId: values.transactionId.trim(),
        senderNumber: values.senderNumber.trim(),
        senderName: values.senderName.trim(),
        screenshot: { public_id: shot.public_id },
      }),
    onSuccess: ({ message }) => {
      toast.success(message);
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      queryClient.invalidateQueries({ queryKey: ["rentals"] });
      queryClient.invalidateQueries({ queryKey: ["packages"] });
    },
    onError: (err) => toast.error(err.message),
  });

  const formik = useFormik({
    initialValues: { transactionId: "", senderNumber: "", senderName: "" },
    validationSchema: Yup.object({
      transactionId: Yup.string()
        .trim()
        .matches(/^[A-Za-z0-9]{6,30}$/, t("payment.errors.tid"))
        .required(t("payment.errors.tid")),
      senderNumber: Yup.string()
        .trim()
        .matches(PHONE, t("payment.errors.phone"))
        .required(t("payment.errors.phone")),
    }),
    onSubmit: (values) => {
      if (!shot) return toast.error(t("payment.errors.screenshot"));
      submit.mutate(values);
    },
  });

  return (
    <form onSubmit={formik.handleSubmit} noValidate className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          label={t("payment.tid")}
          hint={t("payment.tidHint")}
          error={fieldError(formik, "transactionId")}
        >
          <Input
            inputMode="numeric"
            autoComplete="off"
            className="font-mono"
            {...formik.getFieldProps("transactionId")}
          />
        </Field>
        <Field label={t("payment.senderNumber")} error={fieldError(formik, "senderNumber")}>
          <Input
            type="tel"
            autoComplete="tel"
            placeholder="03XX XXXXXXX"
            {...formik.getFieldProps("senderNumber")}
          />
        </Field>
      </div>
      <Field label={t("payment.senderName")}>
        <Input autoComplete="name" {...formik.getFieldProps("senderName")} />
      </Field>

      <Field label={t("payment.screenshot")} hint={t("payment.screenshotHint")}>
        <div className="flex flex-wrap items-center gap-4 rounded-lg border border-dashed border-line-strong p-4">
          {shot ? (
            <img
              src={shot.preview}
              alt=""
              className="h-24 w-auto rounded-md border border-line object-cover"
            />
          ) : (
            <span className="flex size-16 items-center justify-center rounded-md bg-sunken text-2xl text-fg-subtle">
              {upload.isPending ? <Spinner /> : <LuImagePlus aria-hidden />}
            </span>
          )}
          <div className="min-w-0 flex-1">
            {shot ? <p className="truncate text-sm text-fg">{shot.name}</p> : null}
            <Button
              variant="secondary"
              size="sm"
              className="mt-1"
              loading={upload.isPending}
              onClick={() => fileRef.current?.click()}
            >
              {upload.isPending
                ? t("payment.uploading")
                : shot
                  ? t("payment.changeFile")
                  : t("payment.chooseFile")}
            </Button>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            hidden
            onChange={(e) => {
              const file = e.target.files?.[0];
              e.target.value = "";
              if (file) upload.mutate(file);
            }}
          />
        </div>
      </Field>

      <Button
        type="submit"
        size="lg"
        fullWidth
        loading={submit.isPending}
        disabled={upload.isPending}
      >
        {t("payment.submit")}
      </Button>
    </form>
  );
};

// Full class names (Tailwind only generates classes it can see in the source).
const PANEL_TONE = {
  info: "bg-info-soft text-info",
  success: "bg-success-soft text-success",
  danger: "bg-danger-soft text-danger",
  warning: "bg-warning-soft text-warning",
};

const StatusPanel = ({ icon: Icon, tone, title, children }) => (
  <Card className="text-center">
    <span
      className={`mx-auto mb-4 flex size-14 items-center justify-center rounded-full text-3xl ${PANEL_TONE[tone]}`}
    >
      <Icon aria-hidden />
    </span>
    <h2 className="text-2xl font-semibold">{title}</h2>
    <div className="mx-auto mt-2 max-w-md text-fg-muted">{children}</div>
  </Card>
);

/**
 * /account/payments/:paymentId: Easypaisa instructions and the proof form
 * while waiting; then "under review", "confirmed" or "not confirmed" (live:
 * the socket refreshes it when the admin decides).
 */
const PaymentPage = () => {
  const { paymentId } = useParams();
  const { t, price } = useI18n();
  const { data: p, isLoading, isError, error, refetch } = usePayment(paymentId);
  const countdown = useCountdown(p?.status === "awaiting_proof" ? p.expiresAt : null);
  useDocumentTitle(t("payment.eyebrow"));

  // The book behind a rental payment (for the summary).
  const rental = useQuery({
    queryKey: qk.rental(p?.rental),
    queryFn: () => rentals.get(p.rental),
    enabled: Boolean(p?.rental),
  });
  const book = rental.data?.bookId;

  if (isLoading) {
    return (
      <Container size="md" className="py-12">
        <Skeleton className="h-10 w-1/2" />
        <Skeleton className="mt-8 h-80 w-full" rounded="rounded-card" />
      </Container>
    );
  }
  if (isError) {
    return (
      <Container size="md" className="py-12">
        <ErrorState error={error} onRetry={refetch} />
      </Container>
    );
  }

  const ins = p.instructions;
  const expired = p.status === "expired" || (p.status === "awaiting_proof" && countdown?.done);
  const status = expired ? "expired" : p.status;

  return (
    <Container size="md" className="py-10 sm:py-14">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-1 text-xs font-semibold tracking-[0.14em] text-gold uppercase">
            {t("payment.eyebrow")}
          </p>
          <h1 className="text-3xl font-semibold sm:text-4xl">
            {p.purpose === "package" ? t("payment.titlePackage") : t("payment.titleRental")}
          </h1>
        </div>
        <Badge tone={STATUS_TONE[status]} dot>
          {t(`payment.status.${status}`)}
        </Badge>
      </div>

      <Card className="mb-6 flex flex-wrap items-center gap-4">
        {book ? (
          <BookCover src={book.coverImage?.url} title={book.title} author={book.author} size="xs" />
        ) : null}
        <div className="min-w-0 flex-1">
          {book ? <p className="truncate font-serif font-semibold">{book.title}</p> : null}
          <p className="text-sm text-fg-muted">
            {t("payment.reference")}: <span className="font-mono text-fg">{p.reference}</span>
          </p>
        </div>
        <p className="font-serif text-2xl font-semibold">{price(p.amount)}</p>
      </Card>

      {status === "awaiting_proof" ? (
        <div className="space-y-6">
          {countdown ? (
            <Alert tone="warning" title={t("payment.payWithin", { time: countdown.text })} />
          ) : null}

          <Card as="section">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
              <span className="flex size-6 items-center justify-center rounded-full bg-brand text-xs text-on-brand">
                1
              </span>
              {t("payment.step1")}
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <CopyValue label={t("payment.accountNumber")} value={ins?.accountNumber} mono />
              <CopyValue label={t("payment.accountTitle")} value={ins?.accountTitle} />
              <CopyValue label={t("payment.amount")} value={p.amount} />
              <CopyValue label={t("payment.reference")} value={p.reference} mono />
            </div>
            <p className="mt-3 text-sm text-fg-muted">
              {t("payment.noteTip", { reference: p.reference })}
            </p>
          </Card>

          <Card as="section">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
              <span className="flex size-6 items-center justify-center rounded-full bg-brand text-xs text-on-brand">
                2
              </span>
              {t("payment.step2")}
            </h2>
            <ProofForm payment={p} />
          </Card>
        </div>
      ) : status === "submitted" ? (
        <StatusPanel icon={LuHourglass} tone="info" title={t("payment.submittedTitle")}>
          {t("payment.submittedBody")}
        </StatusPanel>
      ) : status === "approved" ? (
        <StatusPanel icon={LuCircleCheck} tone="success" title={t("payment.approvedTitle")}>
          <p>
            {p.purpose === "package" ? t("payment.approvedPackage") : t("payment.approvedRental")}
          </p>
          <Button className="mt-5" to={p.purpose === "package" ? "/books" : "/account"}>
            {p.purpose === "package" ? t("library.browse") : t("rent.viewLibrary")}
          </Button>
        </StatusPanel>
      ) : status === "rejected" ? (
        <StatusPanel icon={LuCircleX} tone="danger" title={t("payment.rejectedTitle")}>
          {p.rejectionReason ? (
            <p>{t("payment.rejectedReason", { reason: p.rejectionReason })}</p>
          ) : null}
          {book ? (
            <Button className="mt-5" variant="secondary" to={`/books/${book._id}`}>
              {book.title}
            </Button>
          ) : null}
        </StatusPanel>
      ) : (
        <StatusPanel icon={LuClock} tone="warning" title={t(`payment.status.${status}`)}>
          <p>{status === "expired" ? t("payment.expiredBody") : t("payment.cancelledBody")}</p>
          {book ? (
            <Button className="mt-5" variant="secondary" to={`/books/${book._id}`}>
              {book.title}
            </Button>
          ) : null}
        </StatusPanel>
      )}

      {p.refund?.status ? (
        <Alert tone="info" className="mt-6" title={t(`payment.refund.${p.refund.status}`)}>
          {p.refund.note}
        </Alert>
      ) : null}

      <p className="mt-8 text-center text-sm">
        <Link to="/account/payments" className="text-fg-muted hover:text-fg">
          ← {t("payment.mineTitle")}
        </Link>
      </p>
    </Container>
  );
};

export default PaymentPage;
