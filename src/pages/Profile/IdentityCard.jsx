import { useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { LuCalendar, LuCamera, LuShieldCheck, LuTrash2 } from "react-icons/lu";
import { toast } from "react-toastify";
import { files, user as userApi } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useI18n } from "@/i18n";
import { Avatar, Badge, Button, Card, Spinner } from "@/ui";

const MAX_BYTES = 5 * 1024 * 1024;
const TYPES = ["image/jpeg", "image/png", "image/webp"];

/** Photo, name, email, role and account facts, with photo upload/remove. */
const IdentityCard = () => {
  const { t, date } = useI18n();
  const { user, preferences, refreshProfile } = useAuth();
  const fileRef = useRef(null);
  const photo = preferences?.profilePicture?.url;

  // Upload to our storage, then attach it to the profile.
  const upload = useMutation({
    mutationFn: async (file) => {
      const [uploaded] = await files.uploadImages([file]);
      return userApi.setProfilePicture({ public_id: uploaded.public_id });
    },
    onSuccess: async () => {
      await refreshProfile();
      toast.success(t("profile.photoUpdated"));
    },
    onError: (err) => toast.error(err.message),
  });

  const remove = useMutation({
    mutationFn: userApi.removeProfilePicture,
    onSuccess: async () => {
      await refreshProfile();
      toast.success(t("profile.photoRemoved"));
    },
    onError: (err) => toast.error(err.message),
  });

  const busy = upload.isPending || remove.isPending;

  const onPick = (e) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow choosing the same file again
    if (!file) return;
    if (!TYPES.includes(file.type)) return toast.error(t("profile.photoTypeError"));
    if (file.size > MAX_BYTES) return toast.error(t("profile.photoSizeError"));
    upload.mutate(file);
  };

  return (
    <Card className="flex flex-col items-center gap-5 text-center sm:flex-row sm:text-start">
      <div className="relative shrink-0">
        <Avatar src={photo} name={user?.name} size="xl" />
        {busy ? (
          <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 text-white">
            <Spinner />
          </span>
        ) : null}
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={busy}
          aria-label={t("profile.changePhoto")}
          title={t("profile.changePhoto")}
          className="absolute -inset-e-1 -bottom-1 flex size-9 items-center justify-center rounded-full bg-brand text-on-brand shadow-pop ring-2 ring-surface transition hover:bg-brand-hover disabled:opacity-60"
        >
          <LuCamera aria-hidden />
        </button>
        <input ref={fileRef} type="file" accept={TYPES.join(",")} hidden onChange={onPick} />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
          <h2 className="truncate text-2xl font-semibold">{user?.name}</h2>
          <Badge tone={user?.role === "admin" ? "gold" : "brand"}>
            {user?.role === "admin" ? t("profile.roleAdmin") : t("profile.roleReader")}
          </Badge>
          <Badge tone={user?.isVerified ? "success" : "warning"} dot>
            {user?.isVerified ? t("profile.verified") : t("profile.unverified")}
          </Badge>
        </div>
        <p className="mt-1 truncate text-fg-muted">{user?.email}</p>
        <div className="mt-3 flex flex-wrap justify-center gap-x-5 gap-y-1 text-sm text-fg-subtle sm:justify-start">
          <span className="inline-flex items-center gap-1.5">
            <LuShieldCheck aria-hidden /> {t(`profile.accountType.${user?.authType ?? "email"}`)}
          </span>
          {user?.createdAt ? (
            <span className="inline-flex items-center gap-1.5">
              <LuCalendar aria-hidden /> {t("profile.joined", { date: date(user.createdAt) })}
            </span>
          ) : null}
        </div>
      </div>

      {photo ? (
        <Button
          variant="ghost"
          size="sm"
          icon={<LuTrash2 aria-hidden />}
          onClick={() => remove.mutate()}
          disabled={busy}
          className="text-danger hover:bg-danger-soft"
        >
          {t("profile.removePhoto")}
        </Button>
      ) : null}
    </Card>
  );
};

export default IdentityCard;
