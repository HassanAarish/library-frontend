import { Outlet } from "react-router-dom";

/**
 * Temporary dark backdrop for screens built with the old "Aurora Glass"
 * styles (sign-in flow, profile). Their light-on-dark text would be
 * unreadable on the new paper background. F2 rebuilds them and removes this.
 */
const LegacyScreen = ({ children }) => (
  <div className="min-h-[60vh] bg-base font-[Outfit] text-ink" data-legacy>
    {children ?? <Outlet />}
  </div>
);

export default LegacyScreen;
