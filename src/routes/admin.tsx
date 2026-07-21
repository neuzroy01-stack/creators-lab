import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  Shield, Loader2, Mail, Lock, Eye, EyeOff, CheckCircle2, AlertCircle, UserPlus,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { anyAdminExists } from "@/lib/registrations.functions";

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
  const checkAdmins = useServerFn(anyAdminExists);

  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [needsBootstrap, setNeedsBootstrap] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const submittingRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        // If already signed in with a role, redirect straight to dashboard
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
        // Check whether the very first admin still needs to be created
        try {
          const r = await checkAdmins();
          if (!cancelled) {
            setNeedsBootstrap(!r.exists);
            if (!r.exists) setMode("signup");
          }
        } catch {
          /* ignore */
        }
      } catch {
        /* show login anyway */
      }
      if (!cancelled) setChecking(false);
    })();
    return () => { cancelled = true; };
  }, [checkAdmins]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submittingRef.current) return;
    submittingRef.current = true;
    setLoading(true);
    setError(null);

    try {
      if (mode === "signup") {
        if (!needsBootstrap) {
          setError("Admin accounts already exist. Please sign in instead.");
          setMode("signin");
          setLoading(false);
          submittingRef.current = false;
          return;
        }
        if (password.length < 8) {
          setError("Password must be at least 8 characters.");
          setLoading(false);
          submittingRef.current = false;
          return;
        }
        // Sign up first super admin
        const { data: signUp, error: suErr } = await supabase.auth.signUp({
          email: email.trim().toLowerCase(),
          password,
          options: { emailRedirectTo: `${window.location.origin}/admin` },
        });
        if (suErr) {
          setError(suErr.message);
          setLoading(false);
          submittingRef.current = false;
          return;
        }
        // If email confirmation is required, session will be null — try password sign-in
        if (!signUp.session) {
          const { error: siErr } = await supabase.auth.signInWithPassword({
            email: email.trim().toLowerCase(),
            password,
          });
          if (siErr) {
            setError("Account created but sign-in failed. Please try signing in.");
            setLoading(false);
            submittingRef.current = false;
            return;
          }
        }
        // Dynamic admin creation is disabled — admins are provisioned via database.
        // This path should never be reached since anyAdminExists returns true when admins exist.
        setError("Admin creation is disabled. Contact the database administrator to provision accounts.");
        setLoading(false);
        submittingRef.current = false;
        return;
      }
      const { data, error: authErr } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (authErr || !data.user) {
        setError(authErr?.message ?? "Invalid email or password.");
        setLoading(false);
        submittingRef.current = false;
        return;
      }

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
      setTimeout(() => window.location.replace("/admin/dashboard"), 600);
    } catch (err) {
      console.error("Admin login error:", err);
      const msg =
        err instanceof Error
          ? err.message
          : typeof err === "string"
            ? err
            : "Network error. Please try again later.";
      setError(msg);
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
        <div className="rounded-3xl glass-strong p-8 border border-white/10 shadow-2xl">
          <div className="flex flex-col items-center text-center mb-8">
            <div
              className="h-16 w-16 rounded-2xl grid place-items-center mb-4 shadow-brand"
              style={{ background: "var(--gradient-brand)" }}
            >
              <Shield className="h-7 w-7 text-white" />
            </div>
            <div className="text-xs tracking-widest uppercase text-muted-foreground mb-1">Creator Lab</div>
            <h1 className="text-2xl font-bold">
              {mode === "signup" ? "Create Super Admin" : "Staff Console"}
            </h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
              {mode === "signup"
                ? "Set up the first admin account. This is a one-time step."
                : "Authorized personnel only. All access is monitored."}
            </p>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
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
                  {mode === "signup" ? "Admin created! Redirecting…" : "Signed in! Redirecting…"}
                </motion.div>
              )}
            </AnimatePresence>

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
                  className="w-full rounded-xl glass pl-10 pr-4 py-3 text-sm outline-none transition-all focus:ring-2 focus:ring-neon/60 focus:border-neon/40 disabled:opacity-50"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                Password {mode === "signup" && <span className="text-muted-foreground/70">(min 8 chars)</span>}
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type={showPwd ? "text" : "password"}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(null); }}
                  required
                  minLength={mode === "signup" ? 8 : 6}
                  autoComplete={mode === "signup" ? "new-password" : "current-password"}
                  disabled={loading || success}
                  placeholder="••••••••"
                  className="w-full rounded-xl glass pl-10 pr-12 py-3 text-sm outline-none transition-all focus:ring-2 focus:ring-neon/60 focus:border-neon/40 disabled:opacity-50"
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

            <button
              type="submit"
              disabled={loading || success || !email || !password}
              className="w-full rounded-xl px-5 py-3 text-sm font-semibold text-white shadow-brand disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.99]"
              style={{ background: "var(--gradient-brand)" }}
            >
              {loading ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> {mode === "signup" ? "Creating…" : "Signing in…"}</>
              ) : success ? (
                <><CheckCircle2 className="h-4 w-4" /> Redirecting…</>
              ) : mode === "signup" ? (
                <><UserPlus className="h-4 w-4" /> Create Super Admin</>
              ) : (
                "Sign in to Console"
              )}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-white/5 text-center space-y-2">
            {needsBootstrap && (
              <div className="text-xs text-gold">
                First-time setup: create the initial super admin.
              </div>
            )}
            {!needsBootstrap && (
              <button
                type="button"
                onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setError(null); }}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                {/* Only sign-in is allowed after bootstrap — no self-serve signup */}
              </button>
            )}
            <p className="text-[11px] text-muted-foreground">
              Unauthorized access is strictly prohibited and monitored. All activity is logged.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
