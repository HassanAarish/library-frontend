import { Link, useNavigate, useParams } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { useFormik } from "formik";
import { toast } from "react-toastify";
import * as Yup from "yup";
import { auth } from "@/lib/api";
import { useI18n } from "@/i18n";
import { useDocumentTitle } from "@/hooks/useBooks";
import { AuthFooter, AuthHeader } from "@/layout/AuthLayout";
import { Button, Field, PasswordInput } from "@/ui";
import { fieldError, rules } from "./forms";

/** Reached from the emailed link: /reset-password/:token */
const ResetPassword = () => {
  const { t } = useI18n();
  useDocumentTitle(t("auth.resetTitle"));
  const { token } = useParams();
  const navigate = useNavigate();
  const r = rules(t);

  const reset = useMutation({
    mutationFn: ({ password }) => auth.resetPassword(token, { password }),
    onSuccess: () => {
      toast.success(t("auth.resetDoneToast"));
      navigate("/login", { replace: true });
    },
    onError: (err) => toast.error(err.message),
  });

  const formik = useFormik({
    initialValues: { password: "", confirm: "" },
    validationSchema: Yup.object({ password: r.newPassword, confirm: r.confirm("password") }),
    onSubmit: (values) => reset.mutate(values),
  });

  return (
    <>
      <AuthHeader title={t("auth.resetTitle")} subtitle={t("auth.resetSubtitle")} />
      <form onSubmit={formik.handleSubmit} noValidate className="space-y-5">
        <Field
          label={t("auth.newPassword")}
          hint={t("auth.passwordHint")}
          error={fieldError(formik, "password")}
        >
          <PasswordInput
            autoComplete="new-password"
            size="lg"
            {...formik.getFieldProps("password")}
          />
        </Field>
        <Field label={t("auth.confirmPassword")} error={fieldError(formik, "confirm")}>
          <PasswordInput
            autoComplete="new-password"
            size="lg"
            {...formik.getFieldProps("confirm")}
          />
        </Field>
        <Button type="submit" size="lg" fullWidth loading={reset.isPending}>
          {t("auth.resetCta")}
        </Button>
      </form>
      <AuthFooter>
        <Link to="/login" className="font-semibold text-brand hover:underline">
          {t("auth.backToSignIn")}
        </Link>
      </AuthFooter>
    </>
  );
};

export default ResetPassword;
