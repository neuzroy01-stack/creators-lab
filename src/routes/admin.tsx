import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Shield, Loader2, Mail, Lock } from "lucide-react";
import { toast } from "sonner";
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
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  // If already signed in AND admin, jump to dashboard
  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        const { data: roles } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", data.user.id);
        if ((roles ?? []).length > 0) {
          navigate({ to: "/admin/dashboard" });
          return;
        }
      }
      setChecking(false);
    })();
  }, [navigate]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error || !data.user) {
        toast.error("Invalid credentials.");
        setLoading(false);
        return;
      }
      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", data.user.id);
      if (!roles || roles.length === 0) {
        await supabase.auth.signOut();
        toast.error("This account has no admin role.");
        setLoading(false);
        return;
      }
      toast.success("Signed in.");
      navigate({ to: "/admin/dashboard" });
    } catch {
      toast.error("Something went wrong.");
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen grid place-items-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen grid place-items-center px-4 pt-24 pb-16">
      <motion.form
        onSubmit={onSubmit}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md rounded-3xl glass-strong p-8"
      >
        <div className="grid place-items-center h-14 w-14 rounded-2xl mx-auto" style={{ background: "var(--gradient-brand)" }}>
          <Shield className="h-6 w-6 text-white" />
        </div>
        <h1 className="mt-5 text-2xl font-bold text-center">Staff Console</h1>
        <p className="mt-1 text-sm text-muted-foreground text-center">Authorized personnel only.</p>

        <div className="mt-6 space-y-3">
          <label className="block">
            <div className="text-xs text-muted-foreground mb-1.5">Email</div>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-xl glass pl-10 pr-4 py-3 text-sm outline-none focus:ring-2 focus:ring-neon/60"
                placeholder="admin@creatorlab.in"
              />
            </div>
          </label>
          <label className="block">
            <div className="text-xs text-muted-foreground mb-1.5">Password</div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full rounded-xl glass pl-10 pr-4 py-3 text-sm outline-none focus:ring-2 focus:ring-neon/60"
                placeholder="••••••••"
              />
            </div>
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-6 w-full rounded-xl px-5 py-3 text-sm font-semibold text-white shadow-brand disabled:opacity-60 inline-flex items-center justify-center gap-2"
          style={{ background: "var(--gradient-brand)" }}
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {loading ? "Signing in…" : "Sign in"}
        </button>

        <p className="mt-4 text-[11px] text-center text-muted-foreground">
          Unauthorized access is prohibited and monitored.
        </p>
      </motion.form>
    </div>
  );
}
