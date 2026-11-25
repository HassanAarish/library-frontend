import { useEffect, useRef } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { LuBell, LuBookOpen, LuBookPlus, LuUser, LuWallet } from "react-icons/lu";
import { useI18n } from "@/i18n";
import { useUnreadCount } from "@/hooks/useNotifications";
import { cn } from "@/ui";

const LINKS = [
  { to: "/account", key: "library.eyebrow", icon: LuBookOpen, end: true },
  { to: "/account/payments", key: "library.payments", icon: LuWallet },
  { to: "/account/requests", key: "requests.mineTitle", icon: LuBookPlus },
  { to: "/account/notifications", key: "inbox.title", icon: LuBell, badge: true },
  { to: "/account/profile", key: "nav.profile", icon: LuUser },
];

/** Tabs across the reader's account pages (scrolls sideways on narrow phones). */
const AccountNav = () => {
  const { t } = useI18n();
  const unread = useUnreadCount();
  const ref = useRef(null);
  const { pathname } = useLocation();

  // On narrow phones the tabs scroll sideways: bring the current one into view.
  useEffect(() => {
    ref.current
      ?.querySelector("[aria-current='page']")
      ?.scrollIntoView({ block: "nearest", inline: "center" });
  }, [pathname]);

  return (
    <nav
      ref={ref}
      aria-label={t("nav.account")}
      className="-mx-4 mb-8 overflow-x-auto px-4 sm:mx-0 sm:px-0"
    >
      <ul className="flex min-w-max gap-1 border-b border-line">
        {LINKS.map(({ to, key, icon: Icon, end, badge }) => (
          <li key={to}>
            <NavLink
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  "-mb-px flex items-center gap-2 border-b-2 px-3 py-2.5 text-sm font-medium whitespace-nowrap transition-colors",
                  isActive
                    ? "border-brand text-fg"
                    : "border-transparent text-fg-muted hover:border-line-strong hover:text-fg",
                )
              }
            >
              <Icon aria-hidden /> {t(key)}
              {badge && unread ? (
                <span className="rounded-full bg-danger px-1.5 text-[0.7rem]/4.5 font-semibold text-white">
                  {unread > 99 ? "99+" : unread}
                </span>
              ) : null}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default AccountNav;
