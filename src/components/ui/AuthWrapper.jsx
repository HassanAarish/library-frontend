import { LuBookOpen, LuSparkles, LuShieldCheck, LuLibrary } from "react-icons/lu";
import AuroraBackground from "@/components/common/AuroraBackground";

const FEATURES = [
  { icon: LuLibrary, text: "Rent and read from a curated catalog" },
  { icon: LuShieldCheck, text: "Role-based access — readers & admins" },
  { icon: LuSparkles, text: "Built to scale, designed to impress" },
];

/**
 * Shared visual chrome for every auth screen: an immersive aurora brand panel
 * on the left and the form card on the right (form panel only on mobile).
 */
const AuthWrapper = ({ title, subtitle, children }) => {
  return (
    <div className="relative min-h-screen overflow-hidden font-body text-ink">
      <AuroraBackground />

      <div className="relative z-10 grid min-h-screen grid-cols-1 lg:grid-cols-2">
        {/* Brand panel */}
        <div className="hidden flex-col justify-between p-12 lg:flex">
          <div className="flex items-center gap-2.5">
            <span className="bg-aurora grid size-10 place-items-center rounded-xl text-white shadow-lg">
              <LuBookOpen />
            </span>
            <p className="font-display text-xl font-bold">
              Library<span className="text-gradient">Hub</span>
            </p>
          </div>

          <div className="max-w-md">
            <h2 className="font-display text-4xl/tight font-bold">
              Your library, <span className="text-gradient">reimagined</span>.
            </h2>
            <p className="mt-4 text-muted">
              A modern management system for readers and administrators — fast, secure and
              beautiful.
            </p>

            <ul className="mt-8 space-y-4">
              {FEATURES.map((f) => (
                <li key={f.text} className="flex items-center gap-3">
                  <span className="bg-aurora-soft grid size-9 place-items-center rounded-lg text-primary">
                    <f.icon />
                  </span>
                  <span className="text-sm text-ink/90">{f.text}</span>
                </li>
              ))}
            </ul>
          </div>

          <p className="text-xs text-faint">
            © {new Date().getFullYear()} LibraryHub. Crafted by Aarish.
          </p>
        </div>

        {/* Form panel */}
        <div className="flex items-center justify-center px-4 py-10 sm:px-8">
          <div className="w-full max-w-md">
            {/* Mobile brand */}
            <div className="mb-8 flex items-center justify-center gap-2.5 lg:hidden">
              <span className="bg-aurora grid size-9 place-items-center rounded-xl text-white">
                <LuBookOpen />
              </span>
              <p className="font-display text-lg font-bold">
                Library<span className="text-gradient">Hub</span>
              </p>
            </div>

            <div className="rounded-3xl glass-strong p-8 shadow-2xl animate-rise glow-primary">
              <div className="mb-8 text-center">
                <h1 className="font-display text-2xl font-bold text-ink">{title}</h1>
                {subtitle && <p className="mt-2 text-sm text-muted">{subtitle}</p>}
              </div>
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthWrapper;
