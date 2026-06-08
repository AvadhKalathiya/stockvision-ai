import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStore } from "@/stores/authStore";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2, Mail, Lock, User } from "lucide-react";

export const Route = createFileRoute("/login")({
  validateSearch: (s: Record<string, unknown>) => ({
    redirect: typeof s.redirect === "string" ? s.redirect : "/dashboard",
  }),
  component: LoginPage,
});

// ─── Error message normalizer ─────────────────────────────────────────────────

function getAuthErrorMessage(error: unknown): string {
  const msg =
    error instanceof Error
      ? error.message
      : typeof error === "object" && error !== null && "message" in error
        ? String((error as Record<string, unknown>).message)
        : String(error);

  const lower = msg.toLowerCase();

  if (lower.includes("invalid login credentials") || lower.includes("invalid_credentials")) {
    return "Incorrect email or password. Please try again.";
  }
  if (lower.includes("email not confirmed") || lower.includes("email_not_confirmed")) {
    return "Please confirm your email address before signing in. Check your inbox.";
  }
  if (lower.includes("user already registered") || lower.includes("already registered") || lower.includes("user_already_exists")) {
    return "An account with this email already exists. Please sign in instead.";
  }
  if (lower.includes("email_address_invalid") || lower.includes("invalid") && lower.includes("email")) {
    return "This email address is not accepted. Please use a work or personal email (not gmail/hotmail).";
  }
  if (lower.includes("password") && (lower.includes("weak") || lower.includes("short") || lower.includes("characters"))) {
    return "Password must be at least 6 characters long.";
  }
  if (lower.includes("rate limit") || lower.includes("too many") || lower.includes("over_email_send_rate_limit")) {
    return "Too many attempts. Please wait a few minutes and try again.";
  }
  if (lower.includes("network") || lower.includes("fetch") || lower.includes("failed")) {
    return "Network error. Check your connection and try again.";
  }
  if (lower.includes("signup disabled") || lower.includes("disable_signup")) {
    return "New registrations are currently disabled. Contact support.";
  }
  if (lower.includes("email_link_expired") || lower.includes("otp_expired")) {
    return "Your confirmation link has expired. Please sign up again.";
  }

  // Return the raw message if unrecognised, trimmed
  return msg.length > 120 ? msg.substring(0, 120) + "…" : msg;
}

// ─── Component ────────────────────────────────────────────────────────────────

function LoginPage() {
  const { redirect } = Route.useSearch();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const initialized = useAuthStore((s) => s.initialized);

  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [confirmationSent, setConfirmationSent] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (initialized && user) {
      navigate({ to: redirect as "/dashboard" });
    }
  }, [initialized, user, navigate, redirect]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic client-side validation
    if (!email.trim()) {
      toast.error("Please enter your email address.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      toast.error("Invalid email address format.");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }
    if (mode === "signup" && !name.trim()) {
      toast.error("Please enter your full name.");
      return;
    }

    setLoading(true);
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/dashboard`,
            data: { name: name.trim() },
          },
        });

        if (error) throw error;

        // Check if user already existed (identities array is empty when user exists)
        if (data.user && data.user.identities && data.user.identities.length === 0) {
          toast.error("An account with this email already exists. Please sign in instead.");
          setMode("signin");
          return;
        }

        // If session is immediately available, email auto-confirm is on
        if (data.session) {
          toast.success("Account created! Welcome to StockVision AI.");
          // authStore will pick up the session via onAuthStateChange
        } else {
          // Email confirmation required
          setConfirmationSent(true);
          toast.success("Account created! Check your email for a confirmation link.");
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (error) throw error;
        toast.success("Welcome back!");
        // Navigation handled by the useEffect above
      }
    } catch (err) {
      toast.error(getAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  // ── Confirmation screen ──────────────────────────────────────────────────

  if (confirmationSent) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-md glass-card p-8 text-center space-y-4">
          <Mail className="size-12 mx-auto text-primary" />
          <h1 className="font-heading text-2xl font-bold">Check your email</h1>
          <p className="text-muted-foreground text-sm">
            We sent a confirmation link to{" "}
            <span className="text-foreground font-medium">{email}</span>.
            <br />
            Click the link to activate your account, then sign in.
          </p>
          <button
            onClick={() => {
              setConfirmationSent(false);
              setMode("signin");
            }}
            className="w-full px-4 py-2.5 rounded-md bg-primary text-primary-foreground font-bold hover:opacity-90 transition"
          >
            Back to Sign in
          </button>
          <button
            onClick={async () => {
              setLoading(true);
              const { error } = await supabase.auth.resend({
                type: "signup",
                email: email.trim(),
                options: { emailRedirectTo: `${window.location.origin}/dashboard` },
              });
              setLoading(false);
              if (error) {
                toast.error(getAuthErrorMessage(error));
              } else {
                toast.success("Confirmation email resent.");
              }
            }}
            disabled={loading}
            className="w-full text-sm text-muted-foreground hover:text-foreground transition disabled:opacity-50"
          >
            {loading ? "Sending…" : "Resend confirmation email"}
          </button>
        </div>
      </main>
    );
  }

  // ── Main login/signup form ───────────────────────────────────────────────

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md glass-card p-8">
        {/* Logo */}
        <Link
          to="/"
          className="block text-center font-heading text-2xl font-bold tracking-wider text-glow-green mb-6"
        >
          STOCKVISION<span className="text-accent"> AI</span>
        </Link>

        {/* Heading */}
        <h1 className="font-heading text-2xl text-center mb-1">
          {mode === "signin" ? "Sign in" : "Create account"}
        </h1>
        <p className="text-center text-sm text-muted-foreground mb-6">
          {mode === "signin"
            ? "Access your forecasts and portfolio."
            : "Start your AI-powered investing journey."}
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3" noValidate>
          {/* Name field (signup only) */}
          {mode === "signup" && (
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                placeholder="Full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoComplete="name"
                className="w-full pl-9 pr-3 py-2.5 rounded-md bg-input border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition"
              />
            </div>
          )}

          {/* Email */}
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete={mode === "signin" ? "email" : "new-password"}
              className="w-full pl-9 pr-3 py-2.5 rounded-md bg-input border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition"
            />
          </div>

          {/* Password */}
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              autoComplete={mode === "signin" ? "current-password" : "new-password"}
              className="w-full pl-9 pr-10 py-2.5 rounded-md bg-input border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>

          {/* Forgot password (sign in only) */}
          {mode === "signin" && (
            <div className="text-right">
              <button
                type="button"
                onClick={async () => {
                  if (!email.trim()) {
                    toast.error("Enter your email address first, then click Forgot Password.");
                    return;
                  }
                  setLoading(true);
                  const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
                    redirectTo: `${window.location.origin}/dashboard`,
                  });
                  setLoading(false);
                  if (error) {
                    toast.error(getAuthErrorMessage(error));
                  } else {
                    toast.success("Password reset email sent. Check your inbox.");
                  }
                }}
                disabled={loading}
                className="text-xs text-muted-foreground hover:text-primary transition disabled:opacity-50"
              >
                Forgot password?
              </button>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-md bg-primary text-primary-foreground font-bold hover:opacity-90 transition disabled:opacity-50"
          >
            {loading ? (
              <><Loader2 className="size-4 animate-spin" /> Processing…</>
            ) : mode === "signin" ? (
              "Sign in"
            ) : (
              "Create account"
            )}
          </button>
        </form>

        {/* Mode toggle */}
        <p className="text-center text-sm text-muted-foreground mt-6">
          {mode === "signin" ? "Don't have an account?" : "Already have an account?"}{" "}
          <button
            onClick={() => {
              setMode(mode === "signin" ? "signup" : "signin");
              setConfirmationSent(false);
            }}
            className="text-primary hover:underline font-medium"
          >
            {mode === "signin" ? "Sign up" : "Sign in"}
          </button>
        </p>

        {/* Note about email restriction */}
        {mode === "signup" && (
          <p className="text-center text-[11px] text-muted-foreground/60 mt-3">
            Use a work or personal email. Some providers (Gmail, Hotmail) may not be accepted
            depending on project settings.
          </p>
        )}
      </div>
    </main>
  );
}
