import { useEffect, useRef, useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { FaFacebookF } from "react-icons/fa";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { auth } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { useI18n } from "@/i18n";
import { FACEBOOK_APP_ID, GOOGLE_CLIENT_ID } from "@/constants";
import { facebookLogin } from "@/utils/facebook";
import { Button, Divider, Modal } from "@/ui";

const PROVIDER_NAMES = { google: "Google", facebook: "Facebook" };

/**
 * Google + Facebook sign-in (hidden when neither is configured). Handles the
 * backend's three answers: a token (signed in), 2FA required (go to the code
 * step), or "an account with this email exists" (ask before linking).
 */
/** Width of an element in whole pixels, kept up to date (null until measured). */
const useBoxWidth = () => {
  const ref = useRef(null);
  const [width, setWidth] = useState(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const observer = new ResizeObserver(([entry]) => setWidth(Math.floor(entry.contentRect.width)));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return [ref, width];
};

const SocialButtons = () => {
  const [googleBox, googleWidth] = useBoxWidth();
  const { t } = useI18n();
  const { signIn } = useAuth();
  const { resolvedTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [busy, setBusy] = useState(false);
  const [link, setLink] = useState(null); // { provider, token, email }

  const authenticate = async (provider, token, linkAccount = false) => {
    setBusy(true);
    try {
      const { raw } = await auth.social({ provider, token, link: linkAccount });
      if (raw.linkRequired) {
        setLink({ provider, token, email: raw.email });
        return;
      }
      if (raw.twoFactorRequired) {
        navigate("/two-factor", {
          state: { pendingToken: raw.pendingToken, from: location.state?.from },
        });
        return;
      }
      if (raw.token) {
        const user = await signIn(raw.token);
        if (user) {
          toast.success(
            raw.deletionCancelled
              ? t("account.deletionKept")
              : t("auth.welcome", { name: user.name?.split(" ")[0] ?? "" }),
          );
        }
      }
    } catch (err) {
      toast.error(err?.message || t("auth.socialFailed"));
    } finally {
      setBusy(false);
    }
  };

  const onFacebook = async () => {
    try {
      const accessToken = await facebookLogin();
      await authenticate("facebook", accessToken);
    } catch {
      toast.info(t("auth.facebookCancelled"));
    }
  };

  if (!GOOGLE_CLIENT_ID && !FACEBOOK_APP_ID) return null;

  const providerName = PROVIDER_NAMES[link?.provider] ?? "";

  return (
    <div className="mt-8">
      <Divider label={t("auth.orContinueWith")} />
      <div className="mt-6 flex flex-col items-stretch gap-3">
        {GOOGLE_CLIENT_ID ? (
          <div ref={googleBox} className="flex w-full justify-center [&>div]:inline-full">
            {googleWidth ? (
              <GoogleLogin
                key={googleWidth}
                onSuccess={(cred) => authenticate("google", cred.credential)}
                onError={() => toast.error(t("auth.socialFailed"))}
                theme={resolvedTheme === "dark" ? "filled_black" : "outline"}
                shape="rectangular"
                text="continue_with"
                size="large"
                // Google allows 200-400px.
                width={String(Math.max(200, Math.min(400, googleWidth)))}
              />
            ) : null}
          </div>
        ) : null}
        {FACEBOOK_APP_ID ? (
          <Button
            variant="secondary"
            size="lg"
            fullWidth
            onClick={onFacebook}
            disabled={busy}
            icon={<FaFacebookF className="text-[#1877F2]" aria-hidden />}
          >
            {t("auth.continueWithFacebook")}
          </Button>
        ) : null}
      </div>

      <Modal
        open={Boolean(link)}
        onClose={() => setLink(null)}
        size="sm"
        title={t("auth.linkTitle", { provider: providerName })}
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => {
                setLink(null);
                navigate("/login", { state: location.state });
              }}
            >
              {t("auth.usePassword")}
            </Button>
            <Button
              loading={busy}
              onClick={() => {
                const pending = link;
                setLink(null);
                authenticate(pending.provider, pending.token, true);
              }}
            >
              {t("auth.linkCta")}
            </Button>
          </>
        }
      >
        <p className="text-sm text-fg-muted">
          {t("auth.linkBody", { email: link?.email ?? "", provider: providerName })}
        </p>
      </Modal>
    </div>
  );
};

export default SocialButtons;
