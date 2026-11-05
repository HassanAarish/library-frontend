import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { LuMenu, LuX } from "react-icons/lu";
import { useAuth } from "@/context/AuthContext";
import { useI18n } from "@/i18n";
import { Button, Container, IconButton, cn } from "@/ui";
import Logo from "./Logo";
import NotificationBell from "./NotificationBell";
import ThemeToggle from "./ThemeToggle";
import UserMenu from "./UserMenu";

const NAV = [
  { to: "/books", key: "nav.browse" },
  { to: "/requests", key: "nav.requests" },
  { to: "/plans", key: "nav.plans" },
];

const linkClass = ({ isActive }) =>
  cn(
    "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
    isActive ? "text-fg bg-sunken" : "text-fg-muted hover:text-fg hover:bg-sunken/70",
  );

const SiteHeader = () => {
  const { isAuthenticated, status } = useAuth();
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  // Close the mobile menu on navigation.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setOpen(false), [pathname]);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-canvas/85 backdrop-blur-md supports-backdrop-filter:bg-canvas/75">
      <Container size="xl" className="flex h-16 items-center gap-4">
        <Logo />

        <nav aria-label="Main" className="ms-6 hidden items-center gap-1 md:flex">
          {NAV.map((item) => (
            <NavLink key={item.to} to={item.to} className={linkClass}>
              {t(item.key)}
            </NavLink>
          ))}
        </nav>

        <div className="ms-auto flex items-center gap-1.5">
          <ThemeToggle />
          {status === "loading" ? null : isAuthenticated ? (
            <>
              <NotificationBell />
              <span className="ms-1.5">
                <UserMenu />
              </span>
            </>
          ) : (
            <div className="hidden items-center gap-2 sm:flex">
              <Button variant="ghost" to="/login">
                {t("nav.signIn")}
              </Button>
              <Button to="/signup">{t("nav.signUp")}</Button>
            </div>
          )}
          <IconButton
            className="md:hidden"
            label={open ? t("nav.closeMenu") : t("nav.menu")}
            icon={open ? <LuX /> : <LuMenu />}
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
          />
        </div>
      </Container>

      {open ? (
        <div className="animate-fade-in border-t border-line bg-canvas md:hidden">
          <Container className="flex flex-col gap-1 py-3">
            {NAV.map((item) => (
              <NavLink key={item.to} to={item.to} className={linkClass}>
                {t(item.key)}
              </NavLink>
            ))}
            {!isAuthenticated && status !== "loading" ? (
              <div className="mt-2 grid grid-cols-2 gap-2">
                <Button variant="secondary" to="/login">
                  {t("nav.signIn")}
                </Button>
                <Button to="/signup">{t("nav.signUp")}</Button>
              </div>
            ) : null}
          </Container>
        </div>
      ) : null}
    </header>
  );
};

export default SiteHeader;
