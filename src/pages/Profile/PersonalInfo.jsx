import { useMutation } from "@tanstack/react-query";
import { useFormik } from "formik";
import { toast } from "react-toastify";
import * as Yup from "yup";
import { user as userApi } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useI18n } from "@/i18n";
import { Button, Card, CardHeader, Field, Input, Select, Switch, Textarea } from "@/ui";
import { fieldError } from "@/pages/Auth/forms";

const GENDERS = ["", "male", "female", "other"];

/** Name, contact details and about-you. */
export const PersonalInfo = () => {
  const { t } = useI18n();
  const { user, preferences, refreshProfile } = useAuth();

  const save = useMutation({
    mutationFn: userApi.updateProfile,
    onSuccess: async () => {
      await refreshProfile();
      toast.success(t("profile.saved"));
    },
    onError: (err) => toast.error(err.message),
  });

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      name: user?.name ?? "",
      phoneNumber: preferences?.phoneNumber ?? "",
      alternativeEmail: preferences?.alternativeEmail ?? "",
      dob: preferences?.dob ? String(preferences.dob).slice(0, 10) : "",
      gender:
        preferences?.gender && preferences.gender !== "prefer not to say" ? preferences.gender : "",
      bio: preferences?.bio ?? "",
    },
    validationSchema: Yup.object({
      name: Yup.string()
        .trim()
        .min(2, t("auth.errors.nameRequired"))
        .required(t("auth.errors.nameRequired")),
      alternativeEmail: Yup.string().trim().email(t("auth.errors.emailInvalid")),
    }),
    onSubmit: (v) =>
      save.mutate({
        name: v.name.trim(),
        prefData: {
          phoneNumber: v.phoneNumber.trim(),
          bio: v.bio.trim(),
          // Optional fields are only sent when filled in.
          ...(v.alternativeEmail.trim() && { alternativeEmail: v.alternativeEmail.trim() }),
          ...(v.dob && { dob: v.dob }),
          gender: v.gender || "prefer not to say",
        },
      }),
  });

  return (
    <Card as="section" aria-labelledby="personal-title">
      <CardHeader
        title={<span id="personal-title">{t("profile.personalTitle")}</span>}
        description={t("profile.personalDescription")}
      />
      <form onSubmit={formik.handleSubmit} noValidate className="grid gap-5 sm:grid-cols-2">
        <Field label={t("auth.name")} error={fieldError(formik, "name")} className="sm:col-span-2">
          <Input autoComplete="name" {...formik.getFieldProps("name")} />
        </Field>
        <Field label={t("profile.phone")}>
          <Input
            type="tel"
            autoComplete="tel"
            placeholder={t("profile.phonePlaceholder")}
            {...formik.getFieldProps("phoneNumber")}
          />
        </Field>
        <Field label={t("profile.altEmail")} error={fieldError(formik, "alternativeEmail")}>
          <Input
            type="email"
            placeholder={t("auth.emailPlaceholder")}
            {...formik.getFieldProps("alternativeEmail")}
          />
        </Field>
        <Field label={t("profile.dob")}>
          <Input type="date" {...formik.getFieldProps("dob")} />
        </Field>
        <Field label={t("profile.gender")}>
          <Select {...formik.getFieldProps("gender")}>
            {GENDERS.map((g) => (
              <option key={g} value={g}>
                {t(`profile.genders.${g}`)}
              </option>
            ))}
          </Select>
        </Field>
        <Field label={t("profile.bio")} className="sm:col-span-2">
          <Textarea
            rows={3}
            maxLength={500}
            placeholder={t("profile.bioPlaceholder")}
            {...formik.getFieldProps("bio")}
          />
        </Field>
        <div className="flex justify-end sm:col-span-2">
          <Button
            type="submit"
            loading={save.isPending}
            disabled={!formik.dirty}
            className="w-full sm:w-auto"
          >
            {t("profile.save")}
          </Button>
        </div>
      </form>
    </Card>
  );
};

/** Email / SMS preferences, saved as soon as a switch is flipped. */
export const NotificationSettings = () => {
  const { t } = useI18n();
  const { preferences, refreshProfile } = useAuth();
  const current = {
    email: preferences?.notifications?.email ?? true,
    push: preferences?.notifications?.push ?? true,
    sms: preferences?.notifications?.sms ?? false,
  };

  const save = useMutation({
    mutationFn: (notifications) => userApi.updateProfile({ prefData: { notifications } }),
    onSuccess: () => refreshProfile(),
    onError: (err) => toast.error(err.message),
  });

  const pending = save.isPending ? save.variables : null;
  const value = pending ?? current;
  const set = (key) => (checked) => save.mutate({ ...current, [key]: checked });

  return (
    <Card as="section">
      <CardHeader
        title={t("profile.notificationsTitle")}
        description={t("profile.notificationsDescription")}
      />
      <div className="grid gap-3 sm:grid-cols-2">
        <Switch
          label={t("profile.notifyEmail")}
          hint={t("profile.notifyEmailHint")}
          checked={value.email}
          onChange={set("email")}
          disabled={save.isPending}
        />
        <Switch
          label={t("profile.notifySms")}
          hint={t("profile.notifySmsHint")}
          checked={value.sms}
          onChange={set("sms")}
          disabled
        />
      </div>
    </Card>
  );
};
