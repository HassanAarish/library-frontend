import { useFormik } from "formik";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import * as Yup from "yup";
import { LuLock, LuShieldCheck } from "react-icons/lu";
import apis from "@/api/index";
import { GlassCard, Input, PrimaryButton } from "@/components";

const schema = Yup.object().shape({
  currentPassword: Yup.string().required("Current password is required"),
  newPassword: Yup.string()
    .min(6, "At least 6 characters")
    .required("New password is required")
    .notOneOf([Yup.ref("currentPassword")], "New password must be different"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("newPassword")], "Passwords do not match")
    .required("Please confirm your password"),
});

const Security = ({ isEmailAccount, authType }) => {
  const { mutate: changePassword, isPending } = useMutation({
    mutationFn: (body) => apis.updatePassword(body),
    onSuccess: ({ data }) => {
      if (data?.success) toast.success(data?.message || "Password updated");
    },
    onError: (err) => toast.error(err || "Couldn't update password"),
  });

  const formik = useFormik({
    initialValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
    validationSchema: schema,
    onSubmit: (values, { resetForm }) => {
      changePassword(
        { currentPassword: values.currentPassword, newPassword: values.newPassword },
        { onSuccess: ({ data }) => data?.success && resetForm() },
      );
    },
  });

  // Social accounts have no password to change.
  if (!isEmailAccount) {
    return (
      <GlassCard className="animate-rise p-6 sm:p-7">
        <h3 className="font-display text-lg font-semibold text-ink">Security</h3>
        <div className="mt-5 flex flex-col items-center gap-3 rounded-xl border border-white/8 bg-white/4 px-4 py-8 text-center">
          <span className="bg-aurora-soft grid size-12 place-items-center rounded-xl text-primary">
            <LuShieldCheck className="text-xl" />
          </span>
          <p className="text-sm text-muted">
            You signed in with <span className="capitalize text-ink">{authType}</span>. Password
            management isn't available for social accounts.
          </p>
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="animate-rise p-6 sm:p-7">
      <h3 className="font-display text-lg font-semibold text-ink">Change password</h3>
      <p className="mt-1 text-sm text-muted">Use a strong password you don't reuse elsewhere.</p>

      <form onSubmit={formik.handleSubmit} className="mt-6 space-y-5">
        <Input
          label="Current Password"
          id="currentPassword"
          type="password"
          icon={LuLock}
          placeholder="••••••••"
          {...formik.getFieldProps("currentPassword")}
          error={formik.errors.currentPassword}
          touched={formik.touched.currentPassword}
        />
        <Input
          label="New Password"
          id="newPassword"
          type="password"
          icon={LuLock}
          placeholder="••••••••"
          {...formik.getFieldProps("newPassword")}
          error={formik.errors.newPassword}
          touched={formik.touched.newPassword}
        />
        <Input
          label="Confirm New Password"
          id="confirmPassword"
          type="password"
          icon={LuLock}
          placeholder="••••••••"
          {...formik.getFieldProps("confirmPassword")}
          error={formik.errors.confirmPassword}
          touched={formik.touched.confirmPassword}
        />

        <PrimaryButton
          type="submit"
          label="Update Password"
          variant="primary"
          isLoading={isPending}
          className="w-full py-2.5"
        />
      </form>
    </GlassCard>
  );
};

export default Security;
