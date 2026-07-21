import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  Users, TrendingUp, CheckCircle2, Clock, XCircle, IndianRupee,
  Search, Download, LogOut, Eye, Trash2, RefreshCw, Loader2, ShieldCheck, KeyRound,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  adminListRegistrations, adminStats, adminUpdateStatus,
  adminDeleteRegistration, adminGetProofUrl,
  adminListAdmins, adminCreateAccount, adminRemoveAccount,
  adminUpdateRole, adminResetPassword,
} from "@/lib/registrations.functions";

export const Route = createFileRoute("/admin/dashboard")({
  head: () => ({
    meta: [
      { title: "Creator Lab — Admin Dashboard" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminDashboard,
});

type Registration = {
  id: string;
  student_code: string | null;
  full_name: string;
  mobile: string;
  email: string;
  course_id: string;
  course_title: string;
  amount: number;
  utr: string;
  screenshot_path: string | null;
  status: "pending" | "verified" | "rejected";
  remarks: string | null;
  payment_date: string;
  created_at: string;
};

const INACTIVITY_MS = 15 * 60 * 1000;

function AdminDashboard() {
  const qc = useQueryClient();
  const list = useServerFn(adminListRegistrations);
  const stats = useServerFn(adminStats);
  const setStatus = useServerFn(adminUpdateStatus);
  const del = useServerFn(adminDeleteRegistration);
  const getProof = useServerFn(adminGetProofUrl);

  const [authOk, setAuthOk] = useState(false);
  const [roles, setRoles] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "verified" | "rejected">("all");
  const [busyId, setBusyId] = useState<string | null>(null);

  // Auth gate + inactivity logout — uses client-side session + RLS (no server fn)
  useEffect(() => {
    let logoutTimer: ReturnType<typeof setTimeout>;
    let cancelled = false;

    const reset = () => {
      clearTimeout(logoutTimer);
      logoutTimer = setTimeout(async () => {
        await supabase.auth.signOut();
        toast.info("Signed out due to inactivity.");
        window.location.replace("/admin");
      }, INACTIVITY_MS);
    };

    (async () => {
      try {
        // Wait for Supabase client to restore session from storage
        const { data: sessionData } = await supabase.auth.getSession();
        if (!sessionData.session?.user) {
          window.location.replace("/admin");
          return;
        }

        // Read roles directly via RLS ("Users can view their own roles" policy)
        const { data: roleRows, error: roleErr } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", sessionData.session.user.id);

        if (cancelled) return;

        if (roleErr || !roleRows || roleRows.length === 0) {
          await supabase.auth.signOut();
          window.location.replace("/admin");
          return;
        }

        setRoles(roleRows.map((r) => r.role as string));
        setAuthOk(true);
        reset();
      } catch {
        if (!cancelled) window.location.replace("/admin");
      }
    })();

    ["mousemove", "keydown", "click"].forEach((e) => window.addEventListener(e, reset));
    return () => {
      cancelled = true;
      clearTimeout(logoutTimer);
      ["mousemove", "keydown", "click"].forEach((e) => window.removeEventListener(e, reset));
    };
  }, []);

  const rowsQ = useQuery({
    enabled: authOk,
    queryKey: ["admin", "registrations"],
    queryFn: async () => (await list()).rows as Registration[],
  });
  const statsQ = useQuery({
    enabled: authOk,
    queryKey: ["admin", "stats"],
    queryFn: async () => await stats(),
  });

  const filtered = useMemo(() => {
    const rows = rowsQ.data ?? [];
    return rows.filter((r) => {
      if (statusFilter !== "all" && r.status !== statusFilter) return false;
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        r.full_name.toLowerCase().includes(q) ||
        r.mobile.includes(q) ||
        r.email.toLowerCase().includes(q) ||
        r.course_title.toLowerCase().includes(q) ||
        (r.student_code ?? "").toLowerCase().includes(q) ||
        r.utr.toLowerCase().includes(q)
      );
    });
  }, [rowsQ.data, statusFilter, search]);

  const isSuperAdmin = roles.includes("super_admin");
  const canVerify = isSuperAdmin || roles.includes("payment_manager");

  const doStatus = async (id: string, s: "verified" | "rejected") => {
    setBusyId(id);
    try {
      await setStatus({ data: { id, status: s } });
      toast.success(`Marked ${s}.`);
      qc.invalidateQueries({ queryKey: ["admin"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed.");
    } finally { setBusyId(null); }
  };

  const doDelete = async (id: string) => {
    if (!confirm("Delete this registration permanently?")) return;
    setBusyId(id);
    try {
      await del({ data: { id } });
      toast.success("Deleted.");
      qc.invalidateQueries({ queryKey: ["admin"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed.");
    } finally { setBusyId(null); }
  };

  const doViewProof = async (path: string) => {
    try {
      const { url } = await getProof({ data: { path } });
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load proof.");
    }
  };

  const exportCsv = () => {
    const rows = filtered;
    const headers = ["Student Code", "Name", "Mobile", "Email", "Course", "Amount", "UTR", "Status", "Registered At", "Remarks"];
    const lines = [
      headers.join(","),
      ...rows.map((r) => [
        r.student_code, r.full_name, r.mobile, r.email, r.course_title,
        r.amount, r.utr, r.status, new Date(r.created_at).toISOString(), (r.remarks ?? "").replace(/,/g, ";"),
      ].map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`).join(",")),
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `creatorlab-registrations-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    window.location.replace("/admin");
  };

  if (!authOk) {
    return (
      <div className="min-h-screen grid place-items-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="pt-28 md:pt-32 pb-16">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <ShieldCheck className="h-4 w-4 text-neon" /> Signed in as {roles.join(", ")}
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mt-1">Admin Dashboard</h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => { qc.invalidateQueries({ queryKey: ["admin"] }); }}
              className="rounded-xl glass px-4 py-2 text-sm font-semibold inline-flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" /> Refresh
            </button>
            <button
              onClick={signOut}
              className="rounded-xl glass px-4 py-2 text-sm font-semibold inline-flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" /> Sign out
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-8 grid gap-4 grid-cols-2 lg:grid-cols-6">
          <StatCard label="Total" value={statsQ.data?.total ?? "…"} icon={<Users className="h-4 w-4" />} />
          <StatCard label="Today" value={statsQ.data?.today ?? "…"} icon={<TrendingUp className="h-4 w-4" />} />
          <StatCard label="Pending" value={statsQ.data?.pending ?? "…"} icon={<Clock className="h-4 w-4 text-gold" />} />
          <StatCard label="Verified" value={statsQ.data?.verified ?? "…"} icon={<CheckCircle2 className="h-4 w-4 text-success" />} />
          <StatCard label="Rejected" value={statsQ.data?.rejected ?? "…"} icon={<XCircle className="h-4 w-4 text-destructive" />} />
          <StatCard label="Revenue" value={`₹${(statsQ.data?.revenue ?? 0).toLocaleString()}`} icon={<IndianRupee className="h-4 w-4 text-neon" />} />
        </div>

        {/* Filters */}
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, mobile, email, course, code, UTR…"
              className="w-full rounded-xl glass pl-10 pr-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-neon/60"
            />
          </div>
          <div className="flex items-center gap-1 rounded-xl glass p-1 text-sm">
            {(["all", "pending", "verified", "rejected"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 rounded-lg capitalize transition ${
                  statusFilter === s ? "text-white shadow-brand" : "text-muted-foreground"
                }`}
                style={statusFilter === s ? { background: "var(--gradient-brand)" } : undefined}
              >
                {s}
              </button>
            ))}
          </div>
          <button
            onClick={exportCsv}
            className="rounded-xl glass px-4 py-2.5 text-sm font-semibold inline-flex items-center gap-2"
          >
            <Download className="h-4 w-4" /> Export CSV
          </button>
        </div>

        {/* Table */}
        <div className="mt-6 rounded-3xl glass-strong overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs uppercase tracking-widest text-muted-foreground bg-white/[0.02]">
                <tr>
                  <th className="text-left px-4 py-3">Code</th>
                  <th className="text-left px-4 py-3">Student</th>
                  <th className="text-left px-4 py-3">Course</th>
                  <th className="text-left px-4 py-3">Amount</th>
                  <th className="text-left px-4 py-3">UTR</th>
                  <th className="text-left px-4 py-3">Status</th>
                  <th className="text-left px-4 py-3">Date</th>
                  <th className="text-right px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rowsQ.isLoading && (
                  <tr><td colSpan={8} className="text-center py-12 text-muted-foreground">
                    <Loader2 className="h-5 w-5 animate-spin inline mr-2" /> Loading…
                  </td></tr>
                )}
                {rowsQ.error && (
                  <tr><td colSpan={8} className="text-center py-12 text-destructive text-xs">
                    {(rowsQ.error as Error).message}
                  </td></tr>
                )}
                {!rowsQ.isLoading && filtered.length === 0 && (
                  <tr><td colSpan={8} className="text-center py-12 text-muted-foreground">No registrations found.</td></tr>
                )}
                {filtered.map((r) => (
                  <motion.tr
                    key={r.id}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="border-t border-white/5 hover:bg-white/[0.02]"
                  >
                    <td className="px-4 py-3 font-mono text-xs">{r.student_code}</td>
                    <td className="px-4 py-3">
                      <div className="font-medium">{r.full_name}</div>
                      <div className="text-xs text-muted-foreground">{r.mobile} · {r.email}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-xs">{r.course_title}</div>
                    </td>
                    <td className="px-4 py-3 font-semibold">₹{Number(r.amount).toLocaleString()}</td>
                    <td className="px-4 py-3 font-mono text-xs">{r.utr}</td>
                    <td className="px-4 py-3"><StatusPill s={r.status} /></td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {new Date(r.created_at).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 justify-end">
                        {r.screenshot_path && (
                          <button
                            onClick={() => doViewProof(r.screenshot_path!)}
                            title="View proof"
                            className="rounded-lg glass p-2 hover:bg-white/10"
                          ><Eye className="h-3.5 w-3.5" /></button>
                        )}
                        {canVerify && r.status !== "verified" && (
                          <button
                            onClick={() => doStatus(r.id, "verified")}
                            disabled={busyId === r.id}
                            className="rounded-lg px-2 py-1 text-xs text-white disabled:opacity-50"
                            style={{ background: "linear-gradient(135deg,#16a34a,#22c55e)" }}
                          >Verify</button>
                        )}
                        {canVerify && r.status !== "rejected" && (
                          <button
                            onClick={() => doStatus(r.id, "rejected")}
                            disabled={busyId === r.id}
                            className="rounded-lg px-2 py-1 text-xs bg-destructive/20 text-destructive hover:bg-destructive/30 disabled:opacity-50"
                          >Reject</button>
                        )}
                        {isSuperAdmin && (
                          <button
                            onClick={() => doDelete(r.id)}
                            disabled={busyId === r.id}
                            title="Delete"
                            className="rounded-lg glass p-2 hover:bg-destructive/20 hover:text-destructive"
                          ><Trash2 className="h-3.5 w-3.5" /></button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {isSuperAdmin && <AdminAccountsPanel />}
      </div>
    </div>
  );
}

function AdminAccountsPanel() {
  const qc = useQueryClient();
  const list = useServerFn(adminListAdmins);
  const create = useServerFn(adminCreateAccount);
  const remove = useServerFn(adminRemoveAccount);
  const updateRole = useServerFn(adminUpdateRole);
  const resetPwd = useServerFn(adminResetPassword);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"super_admin" | "payment_manager" | "support">("support");
  const [busy, setBusy] = useState(false);

  const q = useQuery({
    queryKey: ["admin", "admins"],
    queryFn: async () => (await list()).admins,
  });

  const onCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    if (password.length < 8) { toast.error("Password must be at least 8 characters."); return; }
    setBusy(true);
    try {
      await create({ data: { email: email.trim(), password, role } });
      toast.success("Admin account created.");
      setEmail(""); setPassword(""); setRole("support");
      qc.invalidateQueries({ queryKey: ["admin", "admins"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to create admin.");
    } finally { setBusy(false); }
  };

  const onRemove = async (userId: string, email: string | null) => {
    if (!confirm(`Remove admin ${email ?? userId}? This deletes the user account.`)) return;
    try {
      await remove({ data: { userId } });
      toast.success("Admin removed.");
      qc.invalidateQueries({ queryKey: ["admin", "admins"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to remove admin.");
    }
  };

  const onRoleChange = async (userId: string, newRole: "super_admin" | "payment_manager" | "support") => {
    try {
      await updateRole({ data: { userId, role: newRole } });
      toast.success("Role updated.");
      qc.invalidateQueries({ queryKey: ["admin", "admins"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to update role.");
    }
  };

  const onResetPwd = async (userId: string, email: string | null) => {
    if (!confirm(`Send password reset email to ${email ?? userId}?`)) return;
    try {
      const res = await resetPwd({ data: { userId } });
      if (res.link) {
        toast.success("Recovery link generated.");
      } else {
        toast.success("Password reset email sent.");
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to reset password.");
    }
  };

  return (
    <div className="mt-10">
      <h2 className="text-xl md:text-2xl font-bold mb-4">Admin accounts</h2>
      <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <form onSubmit={onCreate} className="rounded-2xl glass-strong p-6 space-y-3">
          <div className="text-sm font-semibold mb-2">Create new admin</div>
          <input
            type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
            placeholder="Email" autoComplete="off"
            className="w-full rounded-xl glass px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-neon/60"
          />
          <input
            type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)}
            placeholder="Password (min 8 chars)" autoComplete="new-password"
            className="w-full rounded-xl glass px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-neon/60"
          />
          <select
            value={role} onChange={(e) => setRole(e.target.value as typeof role)}
            className="w-full rounded-xl glass px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-neon/60"
          >
            <option value="support">Support (view only)</option>
            <option value="payment_manager">Payment Manager</option>
            <option value="super_admin">Super Admin</option>
          </select>
          <button
            type="submit" disabled={busy}
            className="w-full rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-brand disabled:opacity-50 inline-flex items-center justify-center gap-2"
            style={{ background: "var(--gradient-brand)" }}
          >
            {busy ? <><Loader2 className="h-4 w-4 animate-spin" /> Creating…</> : "Create admin"}
          </button>
        </form>

        <div className="rounded-2xl glass-strong overflow-hidden">
          <table className="w-full text-sm">
            <thead className="text-xs uppercase tracking-widest text-muted-foreground bg-white/[0.02]">
              <tr>
                <th className="text-left px-4 py-3">Email</th>
                <th className="text-left px-4 py-3">Role</th>
                <th className="text-left px-4 py-3">Created</th>
                <th className="text-left px-4 py-3">Change Role</th>
                <th className="text-right px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {q.isLoading && (
                <tr><td colSpan={5} className="text-center py-8 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin inline mr-2" /> Loading…
                </td></tr>
              )}
              {q.data?.map((a) => (
                <tr key={a.id} className="border-t border-white/5">
                  <td className="px-4 py-3">{a.email ?? <span className="text-muted-foreground">—</span>}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-neon/15 text-neon px-2.5 py-1 text-xs font-medium">{a.role}</span>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{new Date(a.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <select
                      value={a.role}
                      onChange={(e) => onRoleChange(a.user_id, e.target.value as "super_admin" | "payment_manager" | "support")}
                      className="rounded-lg glass px-2 py-1 text-xs outline-none focus:ring-2 focus:ring-neon/60"
                    >
                      <option value="support">Support</option>
                      <option value="payment_manager">Payment Manager</option>
                      <option value="super_admin">Super Admin</option>
                    </select>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center gap-1 justify-end">
                      <button
                        onClick={() => onResetPwd(a.user_id, a.email)}
                        className="rounded-lg glass p-2 hover:bg-neon/20 hover:text-neon"
                        title="Reset password"
                      ><KeyRound className="h-3.5 w-3.5" /></button>
                      <button
                        onClick={() => onRemove(a.user_id, a.email)}
                        className="rounded-lg glass p-2 hover:bg-destructive/20 hover:text-destructive"
                        title="Remove admin"
                      ><Trash2 className="h-3.5 w-3.5" /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {q.data && q.data.length === 0 && (
                <tr><td colSpan={5} className="text-center py-8 text-muted-foreground">No admins yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon }: { label: string; value: React.ReactNode; icon: React.ReactNode }) {
  return (
    <div className="rounded-2xl glass p-4">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{label}</span>{icon}
      </div>
      <div className="mt-2 text-2xl font-bold">{value}</div>
    </div>
  );
}

function StatusPill({ s }: { s: "pending" | "verified" | "rejected" }) {
  if (s === "verified") return <span className="rounded-full bg-success/15 text-success px-2.5 py-1 text-xs font-medium">Verified</span>;
  if (s === "rejected") return <span className="rounded-full bg-destructive/15 text-destructive px-2.5 py-1 text-xs font-medium">Rejected</span>;
  return <span className="rounded-full bg-gold/15 text-gold px-2.5 py-1 text-xs font-medium">Pending</span>;
}
