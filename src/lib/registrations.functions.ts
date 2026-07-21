import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const submitSchema = z.object({
  fullName: z.string().trim().min(2).max(100),
  mobile: z.string().trim().regex(/^\+?[0-9\s\-]{7,15}$/, "Invalid mobile"),
  email: z.string().trim().email().max(255),
  courseId: z.string().trim().min(1).max(60),
  courseTitle: z.string().trim().min(1).max(200),
  amount: z.number().nonnegative().max(10_000_000),
  utr: z.string().trim().min(6).max(50),
  screenshotPath: z.string().trim().max(500).optional().nullable(),
  remarks: z.string().trim().max(1000).optional().nullable(),
});

export const submitRegistration = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => submitSchema.parse(input))
  .handler(async ({ data }) => {
    // Uses a SECURITY DEFINER SQL function — no service role key needed.
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY;
    if (!url || !key) {
      return { ok: false as const, error: "config", message: "Server is not configured. Please try again later." };
    }
    const res = await fetch(`${url}/rest/v1/rpc/submit_registration`, {
      method: "POST",
      headers: { "Content-Type": "application/json", apikey: key, Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        p_full_name: data.fullName,
        p_mobile: data.mobile,
        p_email: data.email.toLowerCase(),
        p_course_id: data.courseId,
        p_course_title: data.courseTitle,
        p_amount: data.amount,
        p_utr: data.utr,
        p_screenshot_path: data.screenshotPath ?? null,
        p_remarks: data.remarks ?? null,
      }),
    });
    if (!res.ok) {
      console.error("submitRegistration HTTP error:", res.status, await res.text());
      return { ok: false as const, error: "insert_failed", message: "Could not save registration. Please try again." };
    }
    const rows = await res.json() as Array<{ id: string; student_code: string | null; error: string | null }>;
    const row = rows?.[0];
    if (!row) {
      return { ok: false as const, error: "insert_failed", message: "Could not save registration. Please try again." };
    }
    if (row.error) {
      return { ok: false as const, error: "duplicate", message: row.error.replace(/^duplicate:\s*/, "") };
    }
    return { ok: true as const, id: row.id, code: row.student_code! };
  });

// ---------- Admin operations ----------

async function requireAdmin(supabase: ReturnType<typeof createServerFn> extends never ? never : any, userId: string) {
  const { data, error } = await supabase.from("user_roles").select("role").eq("user_id", userId);
  if (error) throw new Error("Failed to verify admin role");
  const roles = (data ?? []).map((r: { role: string }) => r.role);
  if (roles.length === 0) throw new Error("Forbidden: not an admin");
  return roles as string[];
}

export const adminListRegistrations = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireAdmin(context.supabase, context.userId);
    const { data, error } = await context.supabase
      .from("registrations")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return { rows: data ?? [] };
  });

export const adminStats = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireAdmin(context.supabase, context.userId);
    const { data, error } = await context.supabase.from("registrations").select("amount, status, created_at");
    if (error) throw new Error(error.message);
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const rows = data ?? [];
    return {
      total: rows.length,
      today: rows.filter((r) => new Date(r.created_at) >= today).length,
      pending: rows.filter((r) => r.status === "pending").length,
      verified: rows.filter((r) => r.status === "verified").length,
      rejected: rows.filter((r) => r.status === "rejected").length,
      revenue: rows.filter((r) => r.status === "verified").reduce((s, r) => s + Number(r.amount), 0),
    };
  });

const updateStatusSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(["pending", "verified", "rejected"]),
  remarks: z.string().max(1000).optional().nullable(),
});

export const adminUpdateStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => updateStatusSchema.parse(i))
  .handler(async ({ data, context }) => {
    const roles = await requireAdmin(context.supabase, context.userId);
    if (!roles.some((r) => ["super_admin", "payment_manager"].includes(r))) {
      throw new Error("Forbidden: payment manager role required");
    }
    const { error } = await context.supabase
      .from("registrations")
      .update({
        status: data.status,
        ...(data.remarks !== undefined ? { remarks: data.remarks } : {}),
        ...(data.status === "verified"
          ? { verified_by: context.userId, verified_at: new Date().toISOString() }
          : {}),
      })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

const updateStudentSchema = z.object({
  id: z.string().uuid(),
  full_name: z.string().trim().min(2).max(100).optional(),
  mobile: z.string().trim().max(20).optional(),
  email: z.string().trim().email().max(255).optional(),
  remarks: z.string().max(1000).nullable().optional(),
});

export const adminUpdateStudent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => updateStudentSchema.parse(i))
  .handler(async ({ data, context }) => {
    await requireAdmin(context.supabase, context.userId);
    const { id, ...patch } = data;
    const { error } = await context.supabase.from("registrations").update(patch).eq("id", id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminDeleteRegistration = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => z.object({ id: z.string().uuid() }).parse(i))
  .handler(async ({ data, context }) => {
    const roles = await requireAdmin(context.supabase, context.userId);
    if (!roles.includes("super_admin")) throw new Error("Forbidden: super admin only");
    const { error } = await context.supabase.from("registrations").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// Signed URL for viewing payment proof (admins only)
export const adminGetProofUrl = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => z.object({ path: z.string().min(1).max(500) }).parse(i))
  .handler(async ({ data, context }) => {
    await requireAdmin(context.supabase, context.userId);
    const { data: signed, error } = await context.supabase.storage
      .from("payment-proofs")
      .createSignedUrl(data.path, 300);
    if (error) throw new Error(error.message);
    return { url: signed.signedUrl };
  });

// Current user's roles (for the admin dashboard UI)
export const currentUserRoles = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase.from("user_roles").select("role").eq("user_id", context.userId);
    if (error) throw new Error(error.message);
    return { roles: (data ?? []).map((r) => r.role as string) };
  });

// ---------- Admin bootstrap & admin-account management ----------

export const anyAdminExists = createServerFn({ method: "GET" }).handler(async () => {
  // Uses a SECURITY DEFINER SQL function — no service role key needed.
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY;
  if (!url || !key) return { exists: true }; // assume admins exist if env is missing
  const res = await fetch(`${url}/rest/v1/rpc/any_admin_exists`, {
    method: "POST",
    headers: { "Content-Type": "application/json", apikey: key, Authorization: `Bearer ${key}` },
    body: "{}",
  });
  if (!res.ok) return { exists: true }; // fail safe — don't show bootstrap
  const exists = await res.json();
  return { exists: exists === true };
});

export const adminListAdmins = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const roles = await requireAdmin(context.supabase, context.userId);
    if (!roles.includes("super_admin")) throw new Error("Forbidden: super admin only");
    // Uses a SECURITY DEFINER SQL function — no service role key needed.
    const { data, error } = await context.supabase.rpc("list_admin_accounts");
    if (error) throw new Error(error.message);
    return { admins: (data ?? []) as Array<{ id: string; user_id: string; role: string; email: string | null; created_at: string }> };
  });
