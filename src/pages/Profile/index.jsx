import { useI18n } from "@/i18n";
import AccountPage from "@/components/account/AccountPage";
import IdentityCard from "./IdentityCard";
import { NotificationSettings, PersonalInfo } from "./PersonalInfo";
import { ConnectedAccounts, PasswordSettings, TwoFactorSettings } from "./Security";
import { DeleteAccountSettings } from "./DeleteAccount";

/** /account/profile: details and preferences on the left, sign-in security on the right. */
const Profile = () => {
  const { t } = useI18n();

  return (
    <AccountPage title={t("profile.title")} description={t("profile.description")}>
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
          <DeleteAccountSettings />
        </div>
      </div>
    </AccountPage>
  );
};

export default Profile;
