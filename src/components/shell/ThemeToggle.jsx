import { LuMoon, LuSun } from "react-icons/lu";
import { useTheme } from "@/context/ThemeContext";
import { useI18n } from "@/i18n";
import { IconButton } from "@/ui";

const ThemeToggle = () => {
  const { resolvedTheme, toggle } = useTheme();
  const { t } = useI18n();
  return (
    <IconButton
      label={t("theme.toggle")}
      icon={resolvedTheme === "dark" ? <LuSun /> : <LuMoon />}
      onClick={toggle}
    />
  );
};

export default ThemeToggle;
