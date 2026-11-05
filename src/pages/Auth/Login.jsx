import { Link, useLocation, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { useFormik } from "formik";
import { toast } from "react-toastify";
import * as Yup from "yup";
import { auth } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useI18n } from "@/i18n";
import { useDocumentTitle } from "@/hooks/useBooks";
import { AuthFooter, AuthHeader } from "@/layout/AuthLayout";
import SocialButtons from "@/components/auth/SocialButtons";
import { Button, Field, Input, PasswordInput } from "@/ui";
import { fieldError, rules } from "./forms";

const Login = () => {
  const { t } = useI18n();
  useDocumentTitle(t("auth.loginCta"));
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const r = rules(t);

  const login = useMutation({
    mutationFn: (values) => auth.login({ ...values, authType: "email" }),
    onSuccess: async ({ raw }) => {
      if (raw.twoFactorRequired) {
        navigate("/two-factor", {
          state: { pendingToken: raw.pendingToken, from: location.state?.from },
        });
        return;
      }
      const user = await signIn(raw.token);
      // GuestOnly then sends them back where they came from (or their home).
      if (user) toast.success(t("auth.welcome", { name: user.name?.split(" ")[0] ?? "" }));
    },
    onError: (err, values) => {
      // An unverified account: go to the code step instead of a dead end.
      if (err.status === 403 && /verify your email/i.test(err.message)) {
        toast.info(t("auth.unverifiedToast"));
        navigate("/verify-otp", { state: { email: values.email, fromLogin: true } });
        return;
      }
      toast.error(err.message);
    },
  });

  const formik = useFormik({
    initialValues: { email: location.state?.email ?? "", password: "" },
    validationSchema: Yup.object({ email: r.email, password: r.password }),
    onSubmit: (values) => login.mutate({ ...values, email: values.email.trim() }),
  });

  return (
    <>
      <AuthHeader title={t("auth.loginTitle")} subtitle={t("auth.loginSubtitle")} />
      <form onSubmit={formik.handleSubmit} noValidate className="space-y-5">
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
          error={fieldError(formik, "password")}
          labelAction={
            <Link to="/forgot-password" className="text-sm font-medium text-brand hover:underline">
              {t("auth.forgotLink")}
            </Link>
          }
        >
          <PasswordInput
            autoComplete="current-password"
            size="lg"
            {...formik.getFieldProps("password")}
          />
        </Field>
        <Button type="submit" size="lg" fullWidth loading={login.isPending}>
          {t("auth.loginCta")}
        </Button>
      </form>

      <SocialButtons />

      <AuthFooter>
        {t("auth.noAccount")}{" "}
        <Link
          to="/signup"
          state={location.state}
          className="font-semibold text-brand hover:underline"
        >
          {t("auth.createOne")}
        </Link>
      </AuthFooter>
    </>
  );
};

export default Login;
