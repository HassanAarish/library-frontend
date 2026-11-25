import { Link, Outlet } from "react-router-dom";
import { LuArrowLeft, LuCheck } from "react-icons/lu";
import { useI18n } from "@/i18n";
import Logo from "@/components/shell/Logo";
import ThemeToggle from "@/components/shell/ThemeToggle";
import OfflineBanner from "@/components/shell/OfflineBanner";
import { BookCover } from "@/ui";

const STACK = [
  { title: "Raja Gidh", author: "Bano Qudsia" },
  { title: "The Alchemist", author: "Paulo Coelho" },
  { title: "Aag Ka Darya", author: "Qurratulain Hyder" },
];

/**
 * Sign-in flow frame: an editorial brand panel (large screens only) beside a
 * centred form. On phones it's just the form, full width.
 */
const AuthLayout = () => {
  const { t } = useI18n();

  return (
    <div className="flex min-h-dvh flex-col">
      <OfflineBanner />
      <div className="grid flex-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <aside className="relative hidden overflow-hidden bg-brand p-12 text-on-brand lg:flex lg:flex-col lg:justify-between dark:bg-brand-soft dark:text-fg">
          <Logo inverted />

          <div className="relative z-10 max-w-md">
            <blockquote className="font-serif text-3xl/snug font-medium text-balance">
              “{t("auth.panelQuote")}”
            </blockquote>
            <p className="mt-3 text-sm opacity-75">{t("auth.panelQuoteBy")}</p>
            <ul className="mt-10 space-y-3">
              {["auth.panelPoint1", "auth.panelPoint2", "auth.panelPoint3"].map((key) => (
                <li key={key} className="flex items-center gap-3 text-sm">
                  <span className="flex size-6 items-center justify-center rounded-full bg-white/15">
                    <LuCheck aria-hidden />
                  </span>
                  {t(key)}
                </li>
              ))}
            </ul>
          </div>

          <div
            aria-hidden
            className="pointer-events-none absolute top-1/2 -inset-e-24 flex -translate-y-3/4 gap-4 opacity-80"
          >
            {STACK.map((b, i) => (
              <div
                key={b.title}
                style={{
                  transform: `rotate(${(i - 1) * 7}deg) translateY(${i === 1 ? -2 : 0}rem)`,
                }}
              >
                <BookCover title={b.title} author={b.author} size="lg" />
              </div>
            ))}
          </div>
        </aside>

        <div className="flex flex-col">
          <header className="flex items-center justify-between p-4 sm:px-8">
            <div className="lg:invisible">
              <Logo />
            </div>
            <div className="flex items-center gap-1">
              <Link
                to="/books"
                className="hidden items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-fg-muted hover:bg-sunken hover:text-fg sm:inline-flex"
              >
                <LuArrowLeft className="rtl:rotate-180" aria-hidden /> {t("nav.browse")}
              </Link>
              <ThemeToggle />
            </div>
          </header>

          <main
            id="main"
            className="flex flex-1 items-center justify-center px-4 pt-4 pb-12 sm:px-8"
          >
            <div className="w-full max-w-md">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

/** Title + subtitle at the top of each sign-in screen. */
export const AuthHeader = ({ title, subtitle }) => (
  <div className="mb-8">
    <h1 className="text-3xl font-semibold sm:text-4xl">{title}</h1>
    {subtitle ? <p className="mt-2 text-fg-muted">{subtitle}</p> : null}
  </div>
);

/** "Already have an account? Sign in" footer line. */
export const AuthFooter = ({ children }) => (
  <p className="mt-8 text-center text-sm text-fg-muted">{children}</p>
);

export default AuthLayout;
