import { Link, Navigate, useLocation } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { useFormik } from "formik";
import { LuShieldCheck } from "react-icons/lu";
import { toast } from "react-toastify";
import * as Yup from "yup";
import { twoFactor } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useI18n } from "@/i18n";
import { useDocumentTitle } from "@/hooks/useBooks";
import { AuthFooter, AuthHeader } from "@/layout/AuthLayout";
import { Button, CodeInput, Field } from "@/ui";
import { fieldError, rules } from "./forms";

/** Second step after a password or social sign-in, when 2FA is on. */
const TwoFactorVerify = () => {
  const { t } = useI18n();
  useDocumentTitle(t("auth.twoFactorTitle"));
  const { state } = useLocation();
  const { signIn } = useAuth();
  const pendingToken = state?.pendingToken;

  const verify = useMutation({
    mutationFn: ({ code }) => twoFactor.verify({ pendingToken, code }),
    onSuccess: async ({ raw }) => {
      const user = await signIn(raw.token);
      if (user) toast.success(t("auth.welcome", { name: user.name?.split(" ")[0] ?? "" }));
    },
    onError: (err) => toast.error(err.message),
  });

  const formik = useFormik({
    initialValues: { code: "" },
    validationSchema: Yup.object({ code: rules(t).code }),
    onSubmit: (values) => verify.mutate(values),
  });

  // Only reachable right after the first step.
  if (!pendingToken) return <Navigate to="/login" replace />;

  return (
    <>
      <span className="mb-6 flex size-12 items-center justify-center rounded-full bg-brand-soft text-2xl text-brand">
        <LuShieldCheck aria-hidden />
      </span>
      <AuthHeader title={t("auth.twoFactorTitle")} subtitle={t("auth.twoFactorSubtitle")} />
      <form onSubmit={formik.handleSubmit} noValidate className="space-y-5">
        <Field label={t("auth.twoFactorCode")} error={fieldError(formik, "code")}>
          <CodeInput autoFocus {...formik.getFieldProps("code")} />
        </Field>
        <Button type="submit" size="lg" fullWidth loading={verify.isPending}>
          {t("auth.twoFactorCta")}
        </Button>
      </form>
      <p className="mt-6 text-sm text-fg-subtle">{t("auth.twoFactorLost")}</p>
      <AuthFooter>
        <Link to="/login" className="font-semibold text-brand hover:underline">
          {t("auth.backToSignIn")}
        </Link>
      </AuthFooter>
    </>
  );
};

export default TwoFactorVerify;
