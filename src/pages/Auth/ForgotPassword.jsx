import { useState } from "react";
import { Link } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { useFormik } from "formik";
import { LuMailCheck } from "react-icons/lu";
import { toast } from "react-toastify";
import * as Yup from "yup";
import { auth } from "@/lib/api";
import { useI18n } from "@/i18n";
import { useDocumentTitle } from "@/hooks/useBooks";
import { AuthFooter, AuthHeader } from "@/layout/AuthLayout";
import { Button, Field, Input } from "@/ui";
import { fieldError, rules } from "./forms";

const ForgotPassword = () => {
  const { t } = useI18n();
  useDocumentTitle(t("auth.forgotTitle"));
  const [sentTo, setSentTo] = useState("");

  const send = useMutation({
    mutationFn: ({ email }) => auth.forgotPassword({ email }),
    // The backend answers the same whether or not the account exists.
    onSuccess: (_, { email }) => setSentTo(email),
    onError: (err) => toast.error(err.message),
  });

  const formik = useFormik({
    initialValues: { email: "" },
    validationSchema: Yup.object({ email: rules(t).email }),
    onSubmit: ({ email }) => send.mutate({ email: email.trim() }),
  });

  const back = (
    <AuthFooter>
      <Link to="/login" className="font-semibold text-brand hover:underline">
        {t("auth.backToSignIn")}
      </Link>
    </AuthFooter>
  );

  if (sentTo) {
    return (
      <>
        <span className="mb-6 flex size-12 items-center justify-center rounded-full bg-brand-soft text-2xl text-brand">
          <LuMailCheck aria-hidden />
        </span>
        <AuthHeader
          title={t("auth.forgotSentTitle")}
          subtitle={t("auth.forgotSentBody", { email: sentTo })}
        />
        {back}
      </>
    );
  }

  return (
    <>
      <AuthHeader title={t("auth.forgotTitle")} subtitle={t("auth.forgotSubtitle")} />
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
        <Button type="submit" size="lg" fullWidth loading={send.isPending}>
          {t("auth.forgotCta")}
        </Button>
      </form>
      {back}
    </>
  );
};

export default ForgotPassword;
