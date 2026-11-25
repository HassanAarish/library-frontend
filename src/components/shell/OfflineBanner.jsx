import { useEffect, useState } from "react";
import { LuWifiOff } from "react-icons/lu";
import { useI18n } from "@/i18n";

/** Thin banner while the browser reports no connection. */
const OfflineBanner = () => {
  const { t } = useI18n();
  const [online, setOnline] = useState(() => navigator.onLine);

  useEffect(() => {
    const up = () => setOnline(true);
    const down = () => setOnline(false);
    window.addEventListener("online", up);
    window.addEventListener("offline", down);
    return () => {
      window.removeEventListener("online", up);
      window.removeEventListener("offline", down);
    };
  }, []);

  if (online) return null;
  return (
    <div
      role="status"
      className="flex items-center justify-center gap-2 bg-warning px-4 py-1.5 text-sm text-white"
    >
      <LuWifiOff aria-hidden /> {t("errors.offline")}
    </div>
  );
};

export default OfflineBanner;
