import { FcGoogle } from "react-icons/fc";
import { FaFacebookF, FaApple } from "react-icons/fa";
import { GlassCard, Badge } from "@/components";

// `key` maps to the id field the backend stores on the User when a provider is linked.
const PROVIDERS = [
  { key: "googleId", name: "Google", icon: FcGoogle, brand: "" },
  { key: "facebookId", name: "Facebook", icon: FaFacebookF, brand: "text-[#1877F2]" },
  { key: "appleId", name: "Apple", icon: FaApple, brand: "text-ink" },
];

const ConnectedAccounts = ({ user }) => {
  return (
    <GlassCard className="animate-rise p-6 sm:p-7">
      <h3 className="font-display text-lg font-semibold text-ink">Connected accounts</h3>
      <p className="mt-1 text-sm text-muted">Social sign-ins linked to your account.</p>

      <ul className="mt-5 space-y-3">
        {PROVIDERS.map(({ key, name, icon: Icon, brand }) => {
          const connected = Boolean(user?.[key]);
          return (
            <li
              key={key}
              className="flex items-center gap-3 rounded-xl border border-white/8 bg-white/4 px-4 py-3"
            >
              <span className={`grid size-9 place-items-center rounded-lg bg-white/8 ${brand}`}>
                <Icon className="text-lg" />
              </span>
              <span className="flex-1 text-sm font-medium text-ink">{name}</span>
              {connected ? (
                <Badge tone="approved" dot>
                  Connected
                </Badge>
              ) : (
                <Badge tone="neutral">Not linked</Badge>
              )}
            </li>
          );
        })}
      </ul>
    </GlassCard>
  );
};

export default ConnectedAccounts;
