import { useI18n } from "@/i18n";
import { useDocumentTitle } from "@/hooks/useBooks";
import { Container, PageHeader } from "@/ui";
import AccountNav from "./AccountNav";

/**
 * Shared frame for the account tabs (My library, Payments, Profile): same
 * width, "Account" eyebrow, title + description and the tab bar in the same
 * place, so switching tabs only changes the content below.
 */
const AccountPage = ({ title, description, actions, children }) => {
  const { t } = useI18n();
  useDocumentTitle(title);

  return (
    <Container size="xl" className="py-10 sm:py-14">
      <PageHeader
        eyebrow={t("nav.account")}
        title={title}
        description={description}
        actions={actions}
        className="mb-6"
      />
      <AccountNav />
      {children}
    </Container>
  );
};

export default AccountPage;
