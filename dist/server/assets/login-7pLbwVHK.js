import { X as reactExports, N as jsxRuntimeExports } from "./server-Cgfy5VtR.js";
import { a as Route, x as useNavigate, w as useAuthStore, L as Link, v as toast } from "./router-C3k8-z80.js";
import { s as supabase } from "./client-T0sJvQy8.js";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./index-ChW4vIqc.js";
import "./aiProvider-Cvi-Tcv4.js";
var package_default = {
  version: "1.1.2"
};
var EXPECTED_MESSAGE_TYPE = "authorization_response";
var DEFAULT_OAUTH_BROKER_URL = "/~oauth/initiate";
var DEFAULT_SUPPORTED_OAUTH_ORIGINS = ["https://oauth.lovable.app", "https://lovable.dev"];
var DEFAULT_MOBILE_DEEP_LINK_REDIRECT_URI = "lovable://oauth-callback";
var DEFAULT_DESKTOP_LOCALHOST_REDIRECT_URI = "http://127.0.0.1/iframe-oauth/callback";
var POPUP_CHECK_INTERVAL_MS = 500;
var IFRAME_FALLBACK_TIMEOUT_MS = 12e4;
function startWebMessageListener(supportedOrigins) {
  let resolvePromise;
  const promise = new Promise((resolve) => {
    resolvePromise = resolve;
  });
  const callback = (e) => {
    const isValidOrigin = supportedOrigins.some((origin) => e.origin === origin);
    if (!isValidOrigin) {
      return;
    }
    const data = e.data;
    if (!data || typeof data !== "object") {
      return;
    }
    if (data.type !== EXPECTED_MESSAGE_TYPE) {
      return;
    }
    resolvePromise(data.response);
  };
  const cleanup = () => {
    window.removeEventListener("message", callback);
  };
  window.addEventListener("message", callback);
  return {
    cleanup,
    messagePromise: promise
  };
}
function getPopupDimensions(isInIframe) {
  const hasBrowserPosition = window.screenX !== 0 || window.screenY !== 0 || !isInIframe;
  const width = hasBrowserPosition ? window.outerWidth * 0.5 : window.screen.width * 0.5;
  const height = hasBrowserPosition ? window.outerHeight * 0.5 : window.screen.height * 0.5;
  const left = hasBrowserPosition ? window.screenX + (window.outerWidth - width) / 2 : (window.screen.width - width) / 2;
  const top = hasBrowserPosition ? window.screenY + (window.outerHeight - height) / 2 : (window.screen.height - height) / 2;
  return { width, height, left, top };
}
function processOAuthResponse(data, expectedState) {
  if (data.state !== expectedState) {
    return { error: new Error("State is invalid") };
  }
  if (data.error) {
    if (data.error === "legacy_flow") {
      return {
        error: new Error("This flow is not supported in Preview mode. Please open the app in a new tab to sign in.")
      };
    }
    return { error: new Error(data.error_description ?? "Sign in failed") };
  }
  if (!data.access_token || !data.refresh_token) {
    return { error: new Error("No tokens received") };
  }
  return {
    tokens: { access_token: data.access_token, refresh_token: data.refresh_token },
    error: null
  };
}
function isDevice() {
  const ua = navigator.userAgent;
  if (/iPhone|iPad|iPod|Android/i.test(ua))
    return true;
  if (/Macintosh/i.test(ua) && navigator.maxTouchPoints > 1)
    return true;
  return false;
}
function generateState() {
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    return [...crypto.getRandomValues(new Uint8Array(16))].map((b) => b.toString(16).padStart(2, "0")).join("");
  }
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}
function createAuth(config = {}) {
  const oauthBrokerUrl = config.oauthBrokerUrl ?? DEFAULT_OAUTH_BROKER_URL;
  const supportedOAuthOrigins = config.supportedOAuthOrigins ?? DEFAULT_SUPPORTED_OAUTH_ORIGINS;
  async function signInWithOAuth(provider, opts = {}) {
    let isInIframe = false;
    try {
      isInIframe = window.self !== window.top;
    } catch {
      isInIframe = true;
    }
    const ua = navigator.userAgent;
    const isMobileApp = /LovableApp\//.test(ua);
    const isDesktopApp = !isMobileApp && /lovable/i.test(ua);
    const state = generateState();
    let redirectUri = opts.redirect_uri ?? window.location.origin;
    if (isMobileApp && isInIframe) {
      redirectUri = DEFAULT_MOBILE_DEEP_LINK_REDIRECT_URI;
    } else if (isDesktopApp && isInIframe) {
      redirectUri = DEFAULT_DESKTOP_LOCALHOST_REDIRECT_URI;
    }
    const params = new URLSearchParams({
      ...opts.extraParams,
      provider,
      redirect_uri: redirectUri,
      state
    });
    if (!isInIframe) {
      window.location.href = `${oauthBrokerUrl}?${params.toString()}`;
      return { error: null, redirected: true };
    }
    if (!isMobileApp && !isDesktopApp) {
      params.set("response_mode", "web_message");
    }
    const url = `${oauthBrokerUrl}?${params.toString()}`;
    const effectiveOrigins = isDesktopApp ? [...supportedOAuthOrigins, window.location.origin] : supportedOAuthOrigins;
    const { messagePromise, cleanup } = startWebMessageListener(effectiveOrigins);
    let popup;
    if (isDevice()) {
      popup = window.open(url, "_blank");
    } else {
      const { width, height, left, top } = getPopupDimensions(isInIframe);
      popup = window.open(url, "oauth", `width=${width},height=${height},left=${left},top=${top}`);
    }
    if (!popup && (isMobileApp || isDesktopApp)) {
      let webViewTimeoutId;
      const webViewTimeoutPromise = new Promise((_, reject) => {
        webViewTimeoutId = setTimeout(() => {
          reject(new Error("OAuth timed out waiting for response"));
        }, IFRAME_FALLBACK_TIMEOUT_MS);
      });
      try {
        const data = await Promise.race([messagePromise, webViewTimeoutPromise]);
        return processOAuthResponse(data, state);
      } catch (error) {
        return { error: error instanceof Error ? error : new Error(String(error)) };
      } finally {
        if (webViewTimeoutId)
          clearTimeout(webViewTimeoutId);
        cleanup();
      }
    }
    if (!popup) {
      cleanup();
      return { error: new Error("Popup was blocked") };
    }
    let popupCheckInterval;
    const popupClosedPromise = new Promise((_, reject) => {
      popupCheckInterval = setInterval(() => {
        if (popup.closed) {
          clearInterval(popupCheckInterval);
          reject(new Error("Sign in was cancelled"));
        }
      }, POPUP_CHECK_INTERVAL_MS);
    });
    try {
      const data = await Promise.race([messagePromise, popupClosedPromise]);
      return processOAuthResponse(data, state);
    } catch (error) {
      return {
        error: error instanceof Error ? error : new Error(String(error))
      };
    } finally {
      clearInterval(popupCheckInterval);
      cleanup();
      popup?.close();
    }
  }
  return {
    signInWithOAuth
  };
}
if (typeof window !== "undefined") {
  window.__lovable_cloud_auth_js_version = package_default.version;
}
function createLovableAuth(config = {}) {
  return createAuth(config);
}
const lovableAuth = createLovableAuth();
const lovable = {
  auth: {
    signInWithOAuth: async (provider, opts) => {
      const result = await lovableAuth.signInWithOAuth(provider, {
        redirect_uri: opts?.redirect_uri,
        extraParams: {
          ...opts?.extraParams
        }
      });
      if (result.redirected) {
        return result;
      }
      if (result.error) {
        return result;
      }
      try {
        await supabase.auth.setSession(result.tokens);
      } catch (e) {
        return { error: e instanceof Error ? e : new Error(String(e)) };
      }
      return result;
    }
  }
};
function LoginPage() {
  const {
    redirect
  } = Route.useSearch();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const initialized = useAuthStore((s) => s.initialized);
  const [mode, setMode] = reactExports.useState("signin");
  const [email, setEmail] = reactExports.useState("");
  const [password, setPassword] = reactExports.useState("");
  const [name, setName] = reactExports.useState("");
  const [loading, setLoading] = reactExports.useState(false);
  reactExports.useEffect(() => {
    if (initialized && user) navigate({
      to: redirect
    });
  }, [initialized, user, navigate, redirect]);
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        const {
          error
        } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin + "/dashboard",
            data: {
              name
            }
          }
        });
        if (error) throw error;
        toast.success("Check your email to confirm your account.");
      } else {
        const {
          error
        } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        if (error) throw error;
        toast.success("Welcome back!");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setLoading(false);
    }
  };
  const handleGoogle = async () => {
    setLoading(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin + "/dashboard"
    });
    if (result.error) {
      toast.error("Google sign-in failed");
      setLoading(false);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx("main", { className: "min-h-screen flex items-center justify-center px-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full max-w-md glass-card p-8", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/", className: "block text-center font-heading text-2xl font-bold tracking-wider text-glow-green mb-6", children: [
      "STOCKVISION",
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-accent", children: " AI" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-heading text-2xl text-center mb-1", children: mode === "signin" ? "Sign in" : "Create account" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-center text-sm text-muted-foreground mb-6", children: mode === "signin" ? "Access your forecasts and portfolio." : "Start your AI-powered investing journey." }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: handleGoogle, disabled: loading, className: "w-full mb-4 px-4 py-2.5 rounded-md border border-border bg-secondary hover:bg-secondary/70 transition text-sm font-medium disabled:opacity-50", children: "Continue with Google" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 mb-4 text-xs text-muted-foreground", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 h-px bg-border" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "OR" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 h-px bg-border" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSubmit, className: "space-y-3", children: [
      mode === "signup" && /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "text", placeholder: "Full name", value: name, onChange: (e) => setName(e.target.value), required: true, className: "w-full px-3 py-2.5 rounded-md bg-input border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "email", placeholder: "Email", value: email, onChange: (e) => setEmail(e.target.value), required: true, className: "w-full px-3 py-2.5 rounded-md bg-input border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "password", placeholder: "Password", value: password, onChange: (e) => setPassword(e.target.value), required: true, minLength: 6, className: "w-full px-3 py-2.5 rounded-md bg-input border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "submit", disabled: loading, className: "w-full px-4 py-2.5 rounded-md bg-primary text-primary-foreground font-bold hover:opacity-90 transition disabled:opacity-50", children: loading ? "..." : mode === "signin" ? "Sign in" : "Create account" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-center text-sm text-muted-foreground mt-6", children: [
      mode === "signin" ? "Don't have an account?" : "Already have one?",
      " ",
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setMode(mode === "signin" ? "signup" : "signin"), className: "text-primary hover:underline font-medium", children: mode === "signin" ? "Sign up" : "Sign in" })
    ] })
  ] }) });
}
export {
  LoginPage as component
};
