import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import {
  LuArrowLeft,
  LuBookOpen,
  LuBookPlus,
  LuCalendarClock,
  LuLayoutDashboard,
  LuMenu,
  LuPackage,
  LuScrollText,
  LuTags,
  LuUsers,
  LuWallet,
  LuX,
} from "react-icons/lu";
import { useI18n } from "@/i18n";
import Logo from "@/components/shell/Logo";
import NotificationBell from "@/components/shell/NotificationBell";
import ThemeToggle from "@/components/shell/ThemeToggle";
import UserMenu from "@/components/shell/UserMenu";
import OfflineBanner from "@/components/shell/OfflineBanner";
import ScrollToTop from "@/routes/ScrollToTop";
import { IconButton, cn } from "@/ui";

const NAV = [
  { to: "/admin", key: "admin.dashboard", icon: LuLayoutDashboard, end: true },
  { to: "/admin/payments", key: "admin.payments", icon: LuWallet },
  { to: "/admin/rentals", key: "admin.rentals", icon: LuCalendarClock },
  { to: "/admin/books", key: "admin.books", icon: LuBookOpen },
  { to: "/admin/requests", key: "admin.requests", icon: LuBookPlus },
  { to: "/admin/categories", key: "admin.categories", icon: LuTags },
  { to: "/admin/packages", key: "admin.packages", icon: LuPackage },
  { to: "/admin/users", key: "admin.users", icon: LuUsers },
  { to: "/admin/logs", key: "admin.logs", icon: LuScrollText },
];

const SideNav = ({ t }) => (
  <nav aria-label={t("admin.title")} className="flex flex-col gap-0.5 p-3">
    {NAV.map(({ to, key, icon: Icon, end }) => (
      <NavLink
        key={to}
        to={to}
        end={end}
        className={({ isActive }) =>
          cn(
            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
            isActive ? "bg-brand-soft text-brand" : "text-fg-muted hover:bg-sunken hover:text-fg",
          )
        }
      >
        <Icon className="text-base" aria-hidden />
        {t(key)}
      </NavLink>
    ))}
    <div className="my-2 h-px bg-line" />
    <NavLink
      to="/"
      className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-fg-muted hover:bg-sunken hover:text-fg"
    >
      <LuArrowLeft className="text-base rtl:rotate-180" aria-hidden />
      {t("admin.backToSite")}
    </NavLink>
  </nav>
);

/** Admin console: sidebar (drawer on small screens) + top bar + page. */
const AdminLayout = () => {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setOpen(false), [pathname]);

  return (
    <div className="min-h-dvh bg-canvas lg:grid lg:grid-cols-[15.5rem_1fr]">
      <ScrollToTop />
      <aside className="sticky top-0 hidden h-dvh flex-col border-e border-line bg-surface lg:flex">
        <div className="flex h-16 items-center border-b border-line px-5">
          <Logo to="/admin" />
        </div>
        <div className="flex-1 overflow-y-auto">
          <SideNav t={t} />
        </div>
      </aside>

      {open ? (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
          <button
            type="button"
            aria-label={t("nav.closeMenu")}
            className="absolute inset-0 animate-fade-in bg-black/40"
            onClick={() => setOpen(false)}
          />
          <aside className="absolute inset-y-0 inset-s-0 w-72 animate-fade-in overflow-y-auto bg-surface shadow-pop">
            <div className="flex h-16 items-center justify-between border-b border-line px-5">
              <Logo to="/admin" />
              <IconButton
                label={t("nav.closeMenu")}
                icon={<LuX />}
                onClick={() => setOpen(false)}
              />
            </div>
            <SideNav t={t} />
          </aside>
        </div>
      ) : null}

      <div className="flex min-w-0 flex-col">
        <OfflineBanner />
        <header className="sticky top-0 z-30 flex h-16 items-center gap-2 border-b border-line bg-canvas/85 px-4 backdrop-blur-md sm:px-6">
          <IconButton
            className="lg:hidden"
            label={t("nav.menu")}
            icon={<LuMenu />}
            onClick={() => setOpen(true)}
          />
          <p className="font-serif text-lg font-semibold lg:hidden">{t("admin.title")}</p>
          <div className="ms-auto flex items-center gap-1.5">
            <ThemeToggle />
            <NotificationBell />
            <span className="ms-1.5">
              <UserMenu />
            </span>
          </div>
        </header>
        <main id="main" className="flex-1 px-4 py-8 sm:px-6 lg:px-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
