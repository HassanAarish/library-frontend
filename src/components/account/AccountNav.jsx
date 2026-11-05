import { NavLink } from "react-router-dom";
import { LuBookOpen, LuUser, LuWallet } from "react-icons/lu";
import { useI18n } from "@/i18n";
import { cn } from "@/ui";

const LINKS = [
  { to: "/account", key: "library.eyebrow", icon: LuBookOpen, end: true },
  { to: "/account/payments", key: "library.payments", icon: LuWallet },
  { to: "/account/profile", key: "nav.profile", icon: LuUser },
];

/** Tabs across the reader's account pages (scrolls sideways on narrow phones). */
const AccountNav = () => {
  const { t } = useI18n();
  return (
    <nav aria-label={t("nav.account")} className="-mx-4 mb-8 overflow-x-auto px-4 sm:mx-0 sm:px-0">
      <ul className="flex min-w-max gap-1 border-b border-line">
        {LINKS.map(({ to, key, icon: Icon, end }) => (
          <li key={to}>
            <NavLink
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  "-mb-px flex items-center gap-2 border-b-2 px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "border-brand text-fg"
                    : "border-transparent text-fg-muted hover:border-line-strong hover:text-fg",
                )
              }
            >
              <Icon aria-hidden /> {t(key)}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default AccountNav;
