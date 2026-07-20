import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  Shield, Loader2, Mail, Lock, Eye, EyeOff, CheckCircle2, AlertCircle,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Creator Lab — Staff Console" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminLogin,
});

function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const submittingRef = useRef(false);

  // If already authenticated and admin → redirect immediately via hard nav
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (data.session?.user) {
          const { data: roles } = await supabase
            .from("user_roles")
            .select("role")
            .eq("user_id", data.session.user.id);
          if (!cancelled && (roles ?? []).length > 0) {
            window.location.replace("/admin/dashboard");
            return;
          }
        }
      } catch {
        // network error — show login anyway
      }
      if (!cancelled) setChecking(false);
    })();
    return () => { cancelled = true; };
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submittingRef.current) return;
    submittingRef.current = true;
    setLoading(true);
    setError(null);

    try {
      const { data, error: authErr } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (authErr || !data.user) {
        setError(authErr?.message ?? "Invalid email or password. Please try again.");
        setLoading(false);
        submittingRef.current = false;
        return;
      }

      // Verify admin role
      const { data: roles, error: roleErr } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", data.user.id);

      if (roleErr || !roles || roles.length === 0) {
        await supabase.auth.signOut();
        setError("This account does not have admin privileges.");
        setLoading(false);
        submittingRef.current = false;
        return;
      }

      setSuccess(true);
      toast.success("Signed in successfully!");

      // Hard navigation avoids TanStack Router SSR hydration loop
      setTimeout(() => {
        window.location.replace("/admin/dashboard");
      }, 600);
    } catch (err) {
      setError("Network error. Please check your connection and try again.");
      setLoading(false);
      submittingRef.current = false;
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen grid place-items-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-7 w-7 animate-spin text-muted-foreground" />
          <div className="text-sm text-muted-foreground">Checking session…</div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen grid place-items-center px-4 py-16 relative overflow-hidden"
      style={{ background: "radial-gradient(ellipse 80% 60% at 50% 0%, oklch(0.25 0.08 260 / 0.5), transparent)" }}
    >
      {/* Ambient blobs */}
      <div className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full blur-[120px] opacity-20"
        style={{ background: "var(--gradient-brand)" }} />
      <div className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full blur-[120px] opacity-15"
        style={{ background: "var(--gradient-neon)" }} />

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-md"
      >
        {/* Header card */}
        <div className="rounded-3xl glass-strong p-8 border border-white/10 shadow-2xl">
          {/* Brand mark */}
          <div className="flex flex-col items-center text-center mb-8">
            <div
              className="h-16 w-16 rounded-2xl grid place-items-center mb-4 shadow-brand"
              style={{ background: "var(--gradient-brand)" }}
            >
              <Shield className="h-7 w-7 text-white" />
            </div>
            <div className="text-xs tracking-widest uppercase text-muted-foreground mb-1">Creator Lab</div>
            <h1 className="text-2xl font-bold">Staff Console</h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Authorized personnel only. All access is monitored.
            </p>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            {/* Error/Success banner */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -8, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: "auto" }}
                  exit={{ opacity: 0, y: -8, height: 0 }}
                  className="flex items-start gap-3 rounded-xl bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive"
                >
                  <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                  <span>{error}</span>
                </motion.div>
              )}
              {success && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-3 rounded-xl bg-success/10 border border-success/20 px-4 py-3 text-sm text-success"
                >
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  Signed in! Redirecting to dashboard…
                </motion.div>
              )}
            </AnimatePresence>

            {/* Email field */}
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(null); }}
                  required
                  autoComplete="email"
                  disabled={loading || success}
                  placeholder="admin@creatorlab.in"
                  className="w-full rounded-xl glass pl-10 pr-4 py-3 text-sm outline-none transition-all focus:ring-2 focus:ring-neon/60 focus:border-neon/40 disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            {/* Password field */}
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type={showPwd ? "text" : "password"}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(null); }}
                  required
                  minLength={6}
                  autoComplete="current-password"
                  disabled={loading || success}
                  placeholder="••••••••"
                  className="w-full rounded-xl glass pl-10 pr-12 py-3 text-sm outline-none transition-all focus:ring-2 focus:ring-neon/60 focus:border-neon/40 disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((v) => !v)}
                  tabIndex={-1}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Remember me + Forgot password */}
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer text-muted-foreground hover:text-foreground transition-colors">
                <div
                  onClick={() => setRememberMe((v) => !v)}
                  className={`h-4 w-4 rounded border transition-all cursor-pointer ${
                    rememberMe
                      ? "border-transparent"
                      : "border-white/20 bg-white/5"
                  }`}
                  style={rememberMe ? { background: "var(--gradient-brand)" } : undefined}
                >
                  {rememberMe && (
                    <svg viewBox="0 0 12 12" className="h-full w-full text-white p-0.5">
                      <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
                <span className="text-xs">Remember me</span>
              </label>
              <button
                type="button"
                onClick={() => toast.info("Contact your Super Admin to reset your password.")}
                className="text-xs text-neon hover:underline"
              >
                Forgot password?
              </button>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || success || !email || !password}
              className="w-full rounded-xl px-5 py-3 text-sm font-semibold text-white shadow-brand disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.99]"
              style={{ background: "var(--gradient-brand)" }}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Signing in…
                </>
              ) : success ? (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  Redirecting…
                </>
              ) : (
                "Sign in to Console"
              )}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-white/5 text-center">
            <p className="text-[11px] text-muted-foreground">
              Unauthorized access is strictly prohibited and monitored. All activity is logged.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
