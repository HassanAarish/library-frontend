import { FACEBOOK_APP_ID } from "@/constants";

// Bump to the current Graph API version if Facebook ever rejects this one.
const FB_VERSION = "v21.0";

let sdkPromise = null;

// Lazily inject + initialize the Facebook JS SDK exactly once.
const loadFbSdk = () => {
  if (sdkPromise) return sdkPromise;

  sdkPromise = new Promise((resolve, reject) => {
    if (!FACEBOOK_APP_ID) {
      reject(new Error("Facebook App ID is not configured"));
      return;
    }
    if (window.FB) {
      resolve(window.FB);
      return;
    }

    window.fbAsyncInit = () => {
      window.FB.init({
        appId: FACEBOOK_APP_ID,
        cookie: true,
        xfbml: false,
        version: FB_VERSION,
      });
      resolve(window.FB);
    };

    const scriptId = "facebook-jssdk";
    if (document.getElementById(scriptId)) return;

    const script = document.createElement("script");
    script.id = scriptId;
    script.src = "https://connect.facebook.net/en_US/sdk.js";
    script.async = true;
    script.defer = true;
    script.crossOrigin = "anonymous";
    script.onerror = () => reject(new Error("Failed to load the Facebook SDK"));
    document.body.appendChild(script);
  });

  return sdkPromise;
};

/**
 * Open the Facebook login popup and resolve with the user's access token.
 * Must be called from a user gesture (click) or the popup may be blocked.
 */
export const facebookLogin = () =>
  new Promise((resolve, reject) => {
    loadFbSdk()
      .then((FB) => {
        FB.login(
          (response) => {
            const accessToken = response?.authResponse?.accessToken;
            if (accessToken) resolve(accessToken);
            else reject(new Error("Facebook sign-in was cancelled"));
          },
          { scope: "public_profile,email" },
        );
      })
      .catch(reject);
  });
