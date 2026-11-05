import * as Yup from "yup";

/**
 * Client-side form rules, matching the backend's validators (the backend
 * checks everything again; these just give instant feedback).
 */
export const rules = (t) => ({
  email: Yup.string()
    .trim()
    .email(t("auth.errors.emailInvalid"))
    .required(t("auth.errors.emailRequired")),
  // Login accepts any existing password; new passwords follow the rule.
  password: Yup.string().required(t("auth.errors.passwordRequired")),
  newPassword: Yup.string()
    .required(t("auth.errors.passwordRequired"))
    .min(8, t("auth.errors.passwordRule"))
    .max(128, t("auth.errors.passwordRule"))
    .matches(/[A-Za-z]/, t("auth.errors.passwordRule"))
    .matches(/\d/, t("auth.errors.passwordRule")),
  confirm: (field = "password") =>
    Yup.string()
      .oneOf([Yup.ref(field)], t("auth.errors.passwordMismatch"))
      .required(t("auth.errors.passwordMismatch")),
  name: Yup.string()
    .trim()
    .min(2, t("auth.errors.nameRequired"))
    .max(60)
    .required(t("auth.errors.nameRequired")),
  code: Yup.string()
    .matches(/^\d{6}$/, t("auth.errors.codeInvalid"))
    .required(t("auth.errors.codeInvalid")),
});

/** Formik's error for a field, but only once the user has touched it. */
export const fieldError = (formik, name) =>
  formik.touched[name] && formik.errors[name] ? formik.errors[name] : undefined;
