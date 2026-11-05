import { LuHammer } from "react-icons/lu";
import { useI18n } from "@/i18n";
import { Container, EmptyState } from "@/ui";

/** Placeholder for routes whose screens arrive in a later frontend phase. */
const ComingSoon = ({ title, phase, inConsole }) => {
  const { t } = useI18n();
  const body = (
    <EmptyState
      icon={<LuHammer />}
      title={title || t("common.comingSoon")}
      description={t("common.comingSoonBody", { phase })}
    />
  );
  return inConsole ? body : <Container className="py-16">{body}</Container>;
};

export default ComingSoon;
