import { useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { user as userApi } from "@/lib/api";
import { qk } from "@/lib/queryClient";
import { sessionFlags } from "@/lib/sessionFlags";
import { useAuth } from "@/context/AuthContext";
import { useI18n } from "@/i18n";
import {
  Alert,
  Button,
  Card,
  CardHeader,
  ErrorState,
  Field,
  Modal,
  PasswordInput,
  Skeleton,
} from "@/ui";

const GRACE_DAYS = 14;
const DAY = 86_400_000;
const BLOCKERS = [
  ["reading", "profile.deleteReading", "/account"],
  ["upcoming", "profile.deleteUpcoming", "/account"],
  ["unconfirmed", "profile.deleteUnconfirmed", "/account/payments"],
  ["refunds", "profile.deleteRefunds", "/account/payments"],
];

/**
 * The confirm step: what still stops deletion (from the server), the credits
 * tick box, and the password for email accounts.
 */
const DeleteDialog = ({ open, openedAt, onClose }) => {
  const { t, date } = useI18n();
  const { user, signOut } = useAuth();
  const [password, setPassword] = useState("");
  const [giveUp, setGiveUp] = useState(false);
  const [passwordError, setPasswordError] = useState(null);
  const needsPassword = user?.authType === "email";

  const status = useQuery({
    queryKey: qk.deletionStatus,
    queryFn: userApi.deletionStatus,
    enabled: open,
    staleTime: 0,
  });
  const data = status.data;
  const days = data?.graceDays ?? GRACE_DAYS;

  const remove = useMutation({
    onMutate: () => {
      sessionFlags.closingAccount = true;
    },
    mutationFn: () =>
      userApi.requestDeletion({
        confirm: true,
        ...(needsPassword && { password }),
        ...(data?.credits > 0 && { giveUpCredits: true }),
      }),
    onSuccess: ({ scheduledFor }) => {
      // The server ended every session; the flag stays set until the next
      // sign-in so its "account closed" live event doesn't add a second message.
      // The sign-in guard sees the flag and sends them home.
      signOut();
      toast.success(t("profile.deleteDone", { date: date(scheduledFor) }));
    },
    onError: (err) => {
      sessionFlags.closingAccount = false;
      // A wrong password is a 400 (a 401 would mean the session ended).
      if (err.status === 400 && needsPassword) setPasswordError(err.message);
      else toast.error(err.message);
      status.refetch();
    },
  });

  const blockers = data ? BLOCKERS.filter(([k]) => data.blockers?.[k] > 0) : [];
  const ready =
    data?.canDelete && (!data.credits || giveUp) && (!needsPassword || password.length > 0);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t("profile.deleteModalTitle")}
      footer={
        data?.canDelete ? (
          <>
            <Button variant="ghost" onClick={onClose}>
              {t("common.cancel")}
            </Button>
            <Button
              variant="danger"
              onClick={() => remove.mutate()}
              disabled={!ready}
              loading={remove.isPending}
            >
              {t("profile.deleteSubmit")}
            </Button>
          </>
        ) : null
      }
    >
      <div className="space-y-4 text-sm">
        <p>{t("profile.deleteIntro", { date: date(new Date(openedAt + days * DAY)) })}</p>
        <p className="text-fg-muted">{t("profile.deleteKept")}</p>

        {status.isPending ? (
          <Skeleton className="h-24" />
        ) : status.isError ? (
          <ErrorState error={status.error} onRetry={status.refetch} />
        ) : blockers.length ? (
          <Alert tone="danger" title={t("profile.deleteBlockedTitle")}>
            <p>{t("profile.deleteBlockedBody")}</p>
            <ul className="mt-2 list-disc space-y-1 ps-5">
              {blockers.map(([k, key, to]) => (
                <li key={k}>
                  <Link to={to} className="underline underline-offset-2" onClick={onClose}>
                    {t(key, { count: data.blockers[k] })}
                  </Link>
                </li>
              ))}
            </ul>
          </Alert>
        ) : (
          <div className="space-y-4">
            {data.credits > 0 ? (
              <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-line px-4 py-3">
                <input
                  type="checkbox"
                  className="mt-0.5 size-4 accent-brand"
                  checked={giveUp}
                  onChange={(e) => setGiveUp(e.target.checked)}
                />
                <span className="font-medium">
                  {t("profile.deleteCredits", { count: data.credits })}
                </span>
              </label>
            ) : null}
            {needsPassword ? (
              <Field label={t("profile.deletePassword")} error={passwordError}>
                <PasswordInput
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setPasswordError(null);
                  }}
                />
              </Field>
            ) : null}
          </div>
        )}
      </div>
    </Modal>
  );
};

/** Profile card: delete my account (also required for the Android app). */
export const DeleteAccountSettings = () => {
  const { t } = useI18n();
  const { user } = useAuth();
  const [openedAt, setOpenedAt] = useState(null); // when the dialog opened

  // Admin accounts are removed by another admin, not here.
  if (user?.role === "admin") return null;

  return (
    <Card as="section">
      <CardHeader
        title={t("profile.deleteTitle")}
        description={t("profile.deleteDescription", { days: GRACE_DAYS })}
      />
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="danger" onClick={() => setOpenedAt(Date.now())}>
          {t("profile.deleteCta")}
        </Button>
        <Link
          to="/delete-account"
          className="text-sm text-fg-muted underline underline-offset-2 hover:text-fg"
        >
          {t("profile.deleteHelp")}
        </Link>
      </div>
      <DeleteDialog
        open={openedAt !== null}
        openedAt={openedAt}
        onClose={() => setOpenedAt(null)}
      />
    </Card>
  );
};
