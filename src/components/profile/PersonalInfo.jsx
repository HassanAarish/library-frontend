import { useFormik } from "formik";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import * as Yup from "yup";
import { LuUser, LuPhone, LuMail, LuFileText } from "react-icons/lu";
import apis from "@/api/index";
import { GlassCard, Input, PrimaryButton } from "@/components/index";

const schema = Yup.object().shape({
  name: Yup.string().trim().required("Name is required"),
  alternativeEmail: Yup.string().email("Enter a valid email"),
});

const NotificationToggle = ({ label, hint, checked, onChange }) => (
  <label className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-white/8 bg-white/4 px-4 py-3">
    <span>
      <span className="block text-sm font-medium text-ink">{label}</span>
      <span className="block text-xs text-faint">{hint}</span>
    </span>
    <span
      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
        checked ? "bg-aurora" : "bg-white/10"
      }`}
    >
      <input type="checkbox" className="sr-only" checked={checked} onChange={onChange} />
      <span
        className={`absolute top-0.5 size-5 rounded-full bg-white shadow-sm transition-transform ${
          checked ? "translate-x-5" : "translate-x-0.5"
        }`}
      />
    </span>
  </label>
);

const PersonalInfo = ({ user, preferences, onUpdated }) => {
  const { mutate: save, isPending } = useMutation({
    mutationFn: (body) => apis.updateProfile(body),
    onSuccess: ({ data }) => {
      if (data?.success) {
        toast.success(data?.message || "Profile updated");
        onUpdated?.();
      }
    },
    onError: (err) => toast.error(err || "Couldn't update profile"),
  });

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      name: user?.name || "",
      bio: preferences?.bio || "",
      phoneNumber: preferences?.phoneNumber || "",
      alternativeEmail: preferences?.alternativeEmail || "",
      dob: preferences?.dob ? String(preferences.dob).slice(0, 10) : "",
      gender: preferences?.gender || "",
      notifications: {
        email: preferences?.notifications?.email ?? true,
        push: preferences?.notifications?.push ?? true,
        sms: preferences?.notifications?.sms ?? false,
      },
    },
    validationSchema: schema,
    onSubmit: (values) => {
      // bio / phoneNumber / notifications accept empty values; the validator-guarded
      // fields (alternativeEmail, gender, dob) are only sent when actually set, so we
      // don't trip Mongoose validators/casts with empty strings.
      const prefData = {
        bio: values.bio,
        phoneNumber: values.phoneNumber,
        notifications: values.notifications,
      };
      if (values.alternativeEmail) prefData.alternativeEmail = values.alternativeEmail;
      if (values.gender) prefData.gender = values.gender;
      if (values.dob) prefData.dob = values.dob;

      save({ name: values.name, prefData });
    },
  });

  return (
    <GlassCard className="animate-rise p-6 sm:p-7">
      <h3 className="font-display text-lg font-semibold text-ink">Personal information</h3>
      <p className="mt-1 text-sm text-muted">Update your details and notification preferences.</p>

      <form onSubmit={formik.handleSubmit} className="mt-6 space-y-5">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Input
            label="Full Name"
            id="name"
            icon={LuUser}
            placeholder="Your name"
            {...formik.getFieldProps("name")}
            error={formik.errors.name}
            touched={formik.touched.name}
          />
          <Input
            label="Phone Number"
            id="phoneNumber"
            icon={LuPhone}
            placeholder="+1 555 000 0000"
            {...formik.getFieldProps("phoneNumber")}
          />
          <Input
            label="Alternative Email"
            id="alternativeEmail"
            type="email"
            icon={LuMail}
            placeholder="backup@example.com"
            {...formik.getFieldProps("alternativeEmail")}
            error={formik.errors.alternativeEmail}
            touched={formik.touched.alternativeEmail}
          />

          <Input label="Date of Birth" id="dob" type="date" {...formik.getFieldProps("dob")} />

          <Input
            label="Gender"
            id="gender"
            type="select"
            options={[
              { value: "", label: "Prefer not to say" },
              { value: "male", label: "Male" },
              { value: "female", label: "Female" },
              { value: "other", label: "Other" },
            ]}
            {...formik.getFieldProps("gender")}
          />

          <div className="sm:col-span-2">
            <div className="mb-1.5 ms-1 flex items-center gap-1.5 text-sm font-medium text-gray-300">
              <LuFileText className="text-base" /> Bio
            </div>
            <Input
              id="bio"
              type="textarea"
              placeholder="A little about you…"
              {...formik.getFieldProps("bio")}
            />
          </div>
        </div>

        <div>
          <p className="mb-2 text-sm font-medium text-gray-300">Notifications</p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <NotificationToggle
              label="Email"
              hint="Rentals & alerts"
              checked={formik.values.notifications.email}
              onChange={(e) => formik.setFieldValue("notifications.email", e.target.checked)}
            />
            <NotificationToggle
              label="Push"
              hint="In-app updates"
              checked={formik.values.notifications.push}
              onChange={(e) => formik.setFieldValue("notifications.push", e.target.checked)}
            />
            <NotificationToggle
              label="SMS"
              hint="Text messages"
              checked={formik.values.notifications.sms}
              onChange={(e) => formik.setFieldValue("notifications.sms", e.target.checked)}
            />
          </div>
        </div>

        <div className="flex justify-end">
          <PrimaryButton
            type="submit"
            label="Save Changes"
            variant="primary"
            isLoading={isPending}
            className="px-6 py-2.5"
          />
        </div>
      </form>
    </GlassCard>
  );
};

export default PersonalInfo;
