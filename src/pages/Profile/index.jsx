import { useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { LuCamera, LuTrash2, LuShieldCheck, LuCalendar } from "react-icons/lu";
import apis from "@/api/index";
import { useAuthContext } from "@/context/AuthContext";
import { PageHeader, GlassCard, Badge } from "@/components";
import { formatDate } from "@/utils/helper";
import { useUpload } from "@/hooks";
import { PersonalInfo, Security, TwoFactor, ConnectedAccounts } from "@/components/profile";

const initialsOf = (name = "") =>
  name
    .trim()
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase() || "?";

const Profile = () => {
  const { user, preferences, refreshProfile } = useAuthContext();
  const fileRef = useRef(null);

  const role = user?.role === "admin" ? "admin" : "user";
  const avatarUrl = preferences?.profilePicture?.url;
  const isEmailAccount = user?.authType === "email";

  const { uploadAsync } = useUpload();

  // Upload via the shared hook, then attach it via /user/profile-picture.
  const { mutate: uploadAvatar, isPending: uploading } = useMutation({
    mutationFn: async (file) => {
      const uploaded = await uploadAsync(file);
      return apis.profilePicture({ profilePicture: uploaded });
    },
    onSuccess: () => {
      toast.success("Profile picture updated");
      refreshProfile();
    },
    onError: (err) => toast.error(err?.message || err || "Couldn't update picture"),
  });

  const { mutate: removeAvatar, isPending: removing } = useMutation({
    mutationFn: () => apis.removeProfilePicture(),
    onSuccess: () => {
      toast.success("Profile picture removed");
      refreshProfile();
    },
    onError: (err) => toast.error(err || "Couldn't remove picture"),
  });

  const busy = uploading || removing;

  const onFilePick = (e) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-picking the same file
    if (!file) return;
    if (!file.type.startsWith("image/")) return toast.error("Please choose an image file");
    if (file.size > 5 * 1024 * 1024) return toast.error("Image must be under 5MB");
    uploadAvatar(file);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Account"
        title="Profile"
        subtitle="Manage your personal information and security."
      />

      {/* Identity card */}
      <GlassCard glow className="animate-rise p-6 sm:p-7">
        <div className="flex flex-col items-center gap-5 sm:flex-row">
          <div className="relative shrink-0">
            <div className="bg-aurora grid size-24 place-items-center overflow-hidden rounded-full font-display text-2xl font-semibold text-white">
              {avatarUrl ? (
                <img src={avatarUrl} alt={user?.name} className="size-full object-cover" />
              ) : (
                initialsOf(user?.name)
              )}
            </div>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={busy}
              title="Change picture"
              className="absolute -bottom-1 -inset-e-1 grid size-9 place-items-center rounded-full bg-primary text-white shadow-lg ring-2 ring-midnight-2 transition hover:bg-primary/80 disabled:opacity-50"
            >
              <LuCamera className="text-sm" />
            </button>
            <input ref={fileRef} type="file" accept="image/*" hidden onChange={onFilePick} />
          </div>

          <div className="flex-1 text-center sm:text-start">
            <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
              <h2 className="font-display text-xl font-bold text-ink">{user?.name || "—"}</h2>
              <Badge tone={role === "admin" ? "admin" : "user"}>{role}</Badge>
              <Badge tone={user?.isVerified ? "approved" : "pending"} dot>
                {user?.isVerified ? "verified" : "unverified"}
              </Badge>
            </div>
            <p className="mt-1 text-sm text-faint">{user?.email}</p>
            <div className="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-muted sm:justify-start">
              <span className="inline-flex items-center gap-1.5 capitalize">
                <LuShieldCheck /> {isEmailAccount ? "Email account" : `${user?.authType} account`}
              </span>
              {user?.createdAt && (
                <span className="inline-flex items-center gap-1.5">
                  <LuCalendar /> Joined {formatDate(user.createdAt)}
                </span>
              )}
            </div>
          </div>

          {avatarUrl && (
            <button
              type="button"
              onClick={() => removeAvatar()}
              disabled={busy}
              className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 px-3 py-2 text-xs font-medium text-muted transition-colors hover:bg-danger/15 hover:text-danger disabled:opacity-50"
            >
              <LuTrash2 /> Remove photo
            </button>
          )}
        </div>
      </GlassCard>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <PersonalInfo user={user} preferences={preferences} onUpdated={refreshProfile} />
        </div>
        <div className="space-y-6 lg:col-span-1">
          <Security isEmailAccount={isEmailAccount} authType={user?.authType} />
          <TwoFactor user={user} onUpdated={refreshProfile} />
          <ConnectedAccounts user={user} />
        </div>
      </div>
    </div>
  );
};

export default Profile;
