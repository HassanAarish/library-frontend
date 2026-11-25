/**
 * Small app-wide flags about the current session.
 *
 * closingAccount: this tab is deleting the account right now, so the server's
 * "account closed" live event (sent to every device) is expected here and the
 * delete dialog handles signing out. Cleared on the next sign-in.
 */
export const sessionFlags = { closingAccount: false };
