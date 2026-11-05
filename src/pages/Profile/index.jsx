import { useI18n } from "@/i18n";
import { useDocumentTitle } from "@/hooks/useBooks";
import { Container, PageHeader } from "@/ui";
import IdentityCard from "./IdentityCard";
import { NotificationSettings, PersonalInfo } from "./PersonalInfo";
import { ConnectedAccounts, PasswordSettings, TwoFactorSettings } from "./Security";

/** /account/profile: details and preferences on the left, sign-in security on the right. */
const Profile = () => {
  const { t } = useI18n();
  useDocumentTitle(t("profile.title"));

  return (
    <Container size="xl" className="py-10 sm:py-14">
      <PageHeader
        eyebrow={t("profile.eyebrow")}
        title={t("profile.title")}
        description={t("profile.description")}
      />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_24rem]">
        <div className="space-y-6">
          <IdentityCard />
          <PersonalInfo />
          <NotificationSettings />
        </div>
        <div className="space-y-6">
          <PasswordSettings />
          <TwoFactorSettings />
          <ConnectedAccounts />
        </div>
      </div>
    </Container>
  );
};

export default Profile;
