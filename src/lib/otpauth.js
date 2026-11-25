/**
 * The key inside an otpauth:// link, for typing into an authenticator app that
 * can't scan the QR code. Returns null when there is no usable key.
 */
export const secretFromOtpauth = (url) => {
  if (!url) return null;
  try {
    return new URL(url).searchParams.get("secret") || null;
  } catch {
    return null;
  }
};

/** "JBSWY3DP…" → "JBSW Y3DP …": easier to read and type. Copy the plain key, not this. */
export const groupKey = (key) => (key ? key.replace(/(.{4})(?=.)/g, "$1 ") : "");
