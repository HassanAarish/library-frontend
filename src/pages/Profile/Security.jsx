import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { useFormik } from "formik";
import { FaFacebookF } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { LuShield, LuShieldCheck } from "react-icons/lu";
import { toast } from "react-toastify";
import * as Yup from "yup";
import { twoFactor, user as userApi } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useI18n } from "@/i18n";
import {
  Badge,
  Button,
  Card,
  CardHeader,
  CodeInput,
  Field,
  Modal,
  PasswordInput,
  Skeleton,
  cn,
} from "@/ui";
import { fieldError, rules } from "@/pages/Auth/forms";

/** Change password (email accounts). Success signs out everywhere, including here. */
export const PasswordSettings = () => {
  const { t } = useI18n();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const r = rules(t);

  const change = useMutation({
    mutationFn: ({ currentPassword, newPassword }) =>
      userApi.updatePassword({ currentPassword, newPassword }),
    onSuccess: () => {
      toast.success(t("profile.passwordChanged"));
      signOut();
      navigate("/login", { replace: true, state: { email: user?.email } });
    },
    onError: (err) => toast.error(err.message),
  });

  const formik = useFormik({
    initialValues: { currentPassword: "", newPassword: "", confirm: "" },
    validationSchema: Yup.object({
      currentPassword: r.password,
      newPassword: r.newPassword,
      confirm: r.confirm("newPassword"),
    }),
    onSubmit: (values) => change.mutate(values),
  });

  const social = user?.authType && user.authType !== "email";

  return (
    <Card as="section">
      <CardHeader
        title={t("profile.passwordTitle")}
        description={social ? null : t("profile.passwordDescription")}
      />
      {social ? (
        <p className="text-sm text-fg-muted">
          {t("profile.socialNoPassword", {
            provider: user.authType === "google" ? "Google" : "Facebook",
          })}
        </p>
      ) : (
        <form onSubmit={formik.handleSubmit} noValidate className="space-y-4">
          <Field label={t("profile.currentPassword")} error={fieldError(formik, "currentPassword")}>
            <PasswordInput
              autoComplete="current-password"
              {...formik.getFieldProps("currentPassword")}
            />
          </Field>
          <Field
            label={t("auth.newPassword")}
            hint={t("auth.passwordHint")}
            error={fieldError(formik, "newPassword")}
          >
            <PasswordInput autoComplete="new-password" {...formik.getFieldProps("newPassword")} />
          </Field>
          <Field label={t("auth.confirmPassword")} error={fieldError(formik, "confirm")}>
            <PasswordInput autoComplete="new-password" {...formik.getFieldProps("confirm")} />
          </Field>
          <Button type="submit" variant="secondary" fullWidth loading={change.isPending}>
            {t("profile.changePassword")}
          </Button>
        </form>
      )}
    </Card>
  );
};

/** Turn two-step verification on (scan QR + confirm a code) or off (confirm a code). */
export const TwoFactorSettings = () => {
  const { t } = useI18n();
  const { user, refreshProfile } = useAuth();
  const enabled = Boolean(user?.twoFactor?.enabled);
  const [mode, setMode] = useState(null); // "enable" | "disable" | null
  const [code, setCode] = useState("");

  const setup = useMutation({
    mutationFn: twoFactor.setup, // → { qrCode, otpauthUrl }
    onSuccess: () => setMode("enable"),
    onError: (err) => toast.error(err.message),
  });

  const confirm = useMutation({
    mutationFn: () => (mode === "enable" ? twoFactor.enable(code) : twoFactor.disable(code)),
    onSuccess: async () => {
      toast.success(mode === "enable" ? t("profile.enabled2fa") : t("profile.disabled2fa"));
      close();
      await refreshProfile();
    },
    onError: (err) => toast.error(err.message),
  });

  function close() {
    setMode(null);
    setCode("");
  }

  const validCode = /^\d{6}$/.test(code);

  return (
    <Card as="section">
      <div className="flex items-start gap-3">
        <span
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-lg text-lg",
            enabled ? "bg-success-soft text-success" : "bg-sunken text-fg-subtle",
          )}
        >
          {enabled ? <LuShieldCheck aria-hidden /> : <LuShield aria-hidden />}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-semibold">{t("profile.twoFactorTitle")}</h3>
            <Badge tone={enabled ? "success" : "neutral"} dot>
              {enabled ? t("profile.twoFactorOn") : t("profile.twoFactorOff")}
            </Badge>
          </div>
          <p className="mt-1 text-sm text-fg-muted">{t("profile.twoFactorDescription")}</p>
        </div>
      </div>
      <Button
        className="mt-5"
        fullWidth
        variant={enabled ? "secondary" : "primary"}
        loading={setup.isPending}
        onClick={() => (enabled ? setMode("disable") : setup.mutate())}
      >
        {enabled ? t("profile.disable2fa") : t("profile.enable2fa")}
      </Button>

      <Modal
        open={Boolean(mode)}
        onClose={close}
        size="sm"
        title={mode === "enable" ? t("profile.setupTitle") : t("profile.disableTitle")}
        footer={
          <>
            <Button variant="secondary" onClick={close} disabled={confirm.isPending}>
              {t("common.cancel")}
            </Button>
            <Button
              variant={mode === "enable" ? "primary" : "danger"}
              loading={confirm.isPending}
              disabled={!validCode}
              onClick={() => confirm.mutate()}
            >
              {mode === "enable" ? t("profile.enableCta") : t("profile.disableCta")}
            </Button>
          </>
        }
      >
        {mode === "enable" ? (
          <ol className="space-y-4 text-sm text-fg-muted">
            <li>
              <p>1. {t("profile.setupStep1")}</p>
              <div className="mt-3 flex justify-center">
                {setup.data?.qrCode ? (
                  <img
                    src={setup.data.qrCode}
                    alt="QR code for your authenticator app"
                    className="size-44 rounded-lg border border-line bg-white p-2"
                  />
                ) : (
                  <Skeleton className="size-44" />
                )}
              </div>
            </li>
            <li>2. {t("profile.setupStep2")}</li>
          </ol>
        ) : (
          <p className="text-sm text-fg-muted">{t("profile.disableBody")}</p>
        )}
        <Field label={t("auth.twoFactorCode")} className="mt-4">
          <CodeInput autoFocus value={code} onChange={(e) => setCode(e.target.value)} />
        </Field>
      </Modal>
    </Card>
  );
};

const PROVIDERS = [
  { key: "googleId", type: "google", name: "Google", icon: <FcGoogle aria-hidden /> },
  {
    key: "facebookId",
    type: "facebook",
    name: "Facebook",
    icon: <FaFacebookF className="text-[#1877F2]" aria-hidden />,
  },
];

/** Which social sign-ins are linked. */
export const ConnectedAccounts = () => {
  const { t } = useI18n();
  const { user } = useAuth();
  return (
    <Card as="section">
      <CardHeader
        title={t("profile.connectedTitle")}
        description={t("profile.connectedDescription")}
      />
      <ul className="space-y-2">
        {PROVIDERS.map((p) => {
          const linked = Boolean(user?.[p.key]) || user?.authType === p.type;
          return (
            <li
              key={p.key}
              className="flex items-center gap-3 rounded-lg border border-line px-4 py-3"
            >
              <span className="flex size-8 items-center justify-center rounded-md bg-sunken text-base">
                {p.icon}
              </span>
              <span className="flex-1 text-sm font-medium">{p.name}</span>
              <Badge tone={linked ? "success" : "neutral"} dot={linked}>
                {linked ? t("profile.connected") : t("profile.notConnected")}
              </Badge>
            </li>
          );
        })}
      </ul>
    </Card>
  );
};
