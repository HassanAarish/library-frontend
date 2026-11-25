import { Link, useLocation, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { useFormik } from "formik";
import { toast } from "react-toastify";
import * as Yup from "yup";
import { auth } from "@/lib/api";
import { useI18n } from "@/i18n";
import { useDocumentTitle } from "@/hooks/useBooks";
import { AuthFooter, AuthHeader } from "@/layout/AuthLayout";
import SocialButtons from "@/components/auth/SocialButtons";
import { Button, Field, Input, PasswordInput } from "@/ui";
import { fieldError, rules } from "./forms";

const Signup = () => {
  const { t } = useI18n();
  useDocumentTitle(t("auth.signupCta"));
  const navigate = useNavigate();
  const location = useLocation();
  const r = rules(t);

  const register = useMutation({
    mutationFn: (values) => auth.register({ ...values, authType: "email" }),
    // No token yet: the email must be verified with the emailed code first.
    onSuccess: ({ message }, values) => {
      toast.success(message);
      navigate("/verify-otp", { state: { email: values.email, from: location.state?.from } });
    },
    onError: (err) => toast.error(err.message),
  });

  const formik = useFormik({
    initialValues: { name: "", email: "", password: "" },
    validationSchema: Yup.object({ name: r.name, email: r.email, password: r.newPassword }),
    onSubmit: (values) =>
      register.mutate({ ...values, name: values.name.trim(), email: values.email.trim() }),
  });

  return (
    <>
      <AuthHeader title={t("auth.signupTitle")} subtitle={t("auth.signupSubtitle")} />
      <form onSubmit={formik.handleSubmit} noValidate className="space-y-5">
        <Field label={t("auth.name")} error={fieldError(formik, "name")}>
          <Input
            autoComplete="name"
            size="lg"
            placeholder={t("auth.namePlaceholder")}
            {...formik.getFieldProps("name")}
          />
        </Field>
        <Field label={t("auth.email")} error={fieldError(formik, "email")}>
          <Input
            type="email"
            autoComplete="email"
            size="lg"
            placeholder={t("auth.emailPlaceholder")}
            {...formik.getFieldProps("email")}
          />
        </Field>
        <Field
          label={t("auth.password")}
          hint={t("auth.passwordHint")}
          error={fieldError(formik, "password")}
        >
          <PasswordInput
            autoComplete="new-password"
            size="lg"
            {...formik.getFieldProps("password")}
          />
        </Field>
        <Button type="submit" size="lg" fullWidth loading={register.isPending}>
          {t("auth.signupCta")}
        </Button>
        <p className="text-center text-xs text-fg-subtle">
          {t("auth.agreePrefix")}{" "}
          <Link to="/terms" className="underline hover:text-fg">
            {t("footer.terms")}
          </Link>{" "}
          {t("auth.agreeAnd")}{" "}
          <Link to="/privacy" className="underline hover:text-fg">
            {t("footer.privacy")}
          </Link>
          .
        </p>
      </form>

      <SocialButtons />

      <AuthFooter>
        {t("auth.haveAccount")}{" "}
        <Link
          to="/login"
          state={location.state}
          className="font-semibold text-brand hover:underline"
        >
          {t("auth.signInInstead")}
        </Link>
      </AuthFooter>
    </>
  );
};

export default Signup;
