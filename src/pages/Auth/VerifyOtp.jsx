import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { useFormik } from "formik";
import { toast } from "react-toastify";
import * as Yup from "yup";
import { auth } from "@/lib/api";
import { useI18n } from "@/i18n";
import { useDocumentTitle } from "@/hooks/useBooks";
import { AuthFooter, AuthHeader } from "@/layout/AuthLayout";
import { Button, CodeInput, Field } from "@/ui";
import { fieldError, rules } from "./forms";

// Matches the backend's RESEND_COOLDOWN_MS.
const RESEND_COOLDOWN = 60;

const VerifyOtp = () => {
  const { t } = useI18n();
  useDocumentTitle(t("auth.verifyTitle"));
  const navigate = useNavigate();
  const { state } = useLocation();
  const email = state?.email ?? "";

  // After sign-up a code was just sent, so wait. From a login redirect none was.
  const [cooldown, setCooldown] = useState(state?.fromLogin ? 0 : RESEND_COOLDOWN);
  useEffect(() => {
    if (cooldown <= 0) return undefined;
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const verify = useMutation({
    mutationFn: ({ otp }) => auth.verifyOtp({ email, otp }),
    onSuccess: () => {
      toast.success(t("auth.verifiedToast"));
      navigate("/login", { state: { email, from: state?.from } });
    },
    onError: (err) => toast.error(err.message),
  });

  const resend = useMutation({
    mutationFn: () => auth.resendOtp({ email }),
    onSuccess: ({ message }) => {
      toast.success(message);
      setCooldown(RESEND_COOLDOWN);
    },
    onError: (err) => toast.error(err.message),
  });

  const formik = useFormik({
    initialValues: { otp: "" },
    validationSchema: Yup.object({ otp: rules(t).code }),
    onSubmit: (values) => verify.mutate(values),
  });

  return (
    <>
      <AuthHeader
        title={t("auth.verifyTitle")}
        subtitle={email ? t("auth.verifySubtitle", { email }) : t("auth.verifySubtitleNoEmail")}
      />
      <form onSubmit={formik.handleSubmit} noValidate className="space-y-5">
        <Field label={t("auth.code")} error={fieldError(formik, "otp")}>
          <CodeInput autoFocus {...formik.getFieldProps("otp")} />
        </Field>
        <Button type="submit" size="lg" fullWidth loading={verify.isPending} disabled={!email}>
          {t("auth.verifyCta")}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-fg-muted" aria-live="polite">
        {t("auth.noCode")}{" "}
        {email && cooldown <= 0 ? (
          <Button
            variant="link"
            size="sm"
            onClick={() => resend.mutate()}
            disabled={resend.isPending}
          >
            {resend.isPending ? t("auth.sending") : t("auth.resend")}
          </Button>
        ) : email ? (
          <span className="text-fg-subtle">{t("auth.resendIn", { seconds: cooldown })}</span>
        ) : null}
      </p>

      <AuthFooter>
        {t("auth.wrongEmail")}{" "}
        <Link to="/signup" className="font-semibold text-brand hover:underline">
          {t("auth.startOver")}
        </Link>
      </AuthFooter>
    </>
  );
};

export default VerifyOtp;
