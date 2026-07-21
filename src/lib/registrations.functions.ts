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
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // Prevent duplicate submissions (same mobile + course)
    const { data: existing } = await supabaseAdmin
      .from("registrations")
      .select("id, student_code, status")
      .eq("mobile", data.mobile)
      .eq("course_id", data.courseId)
      .maybeSingle();
    if (existing) {
      return {
        ok: false as const,
        error: "duplicate",
        message: `You already have a registration for this course (${existing.student_code ?? existing.id}). Contact us on WhatsApp for help.`,
      };
    }

    const { data: row, error } = await supabaseAdmin
      .from("registrations")
      .insert({
        full_name: data.fullName,
        mobile: data.mobile,
        email: data.email.toLowerCase(),
        course_id: data.courseId,
        course_title: data.courseTitle,
        amount: data.amount,
        utr: data.utr,
        screenshot_path: data.screenshotPath ?? null,
        remarks: data.remarks ?? null,
        status: "pending",
      })
      .select("id, student_code")
      .single();

    if (error) {
      console.error("submitRegistration error:", error);
      return { ok: false as const, error: "insert_failed", message: "Could not save registration. Please try again." };
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
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: signed, error } = await supabaseAdmin.storage
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
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { count, error } = await supabaseAdmin
    .from("user_roles")
    .select("id", { count: "exact", head: true });
  if (error) throw new Error(error.message);
  return { exists: (count ?? 0) > 0 };
});

// If no admins exist, promote the currently signed-in user to super_admin.
export const bootstrapFirstAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { count, error: cErr } = await supabaseAdmin
      .from("user_roles")
      .select("id", { count: "exact", head: true });
    if (cErr) throw new Error(cErr.message);
    if ((count ?? 0) > 0) {
      return { ok: false as const, message: "Admin accounts already exist. Contact your super admin." };
    }
    const { error } = await supabaseAdmin
      .from("user_roles")
      .insert({ user_id: context.userId, role: "super_admin" });
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

export const adminListAdmins = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const roles = await requireAdmin(context.supabase, context.userId);
    if (!roles.includes("super_admin")) throw new Error("Forbidden: super admin only");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: roleRows, error } = await supabaseAdmin
      .from("user_roles")
      .select("id, user_id, role, created_at")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    const results: Array<{ id: string; user_id: string; role: string; email: string | null; created_at: string }> = [];
    for (const r of roleRows ?? []) {
      const { data: u } = await supabaseAdmin.auth.admin.getUserById(r.user_id);
      results.push({ ...r, email: u?.user?.email ?? null });
    }
    return { admins: results };
  });

const createAdminSchema = z.object({
  email: z.string().trim().email().max(255),
  password: z.string().min(8).max(72),
  role: z.enum(["super_admin", "payment_manager", "support"]),
});

export const adminCreateAccount = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => createAdminSchema.parse(i))
  .handler(async ({ data, context }) => {
    const roles = await requireAdmin(context.supabase, context.userId);
    if (!roles.includes("super_admin")) throw new Error("Forbidden: super admin only");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: created, error } = await supabaseAdmin.auth.admin.createUser({
      email: data.email.toLowerCase(),
      password: data.password,
      email_confirm: true,
    });
    if (error || !created.user) throw new Error(error?.message ?? "Failed to create user");
    const { error: rErr } = await supabaseAdmin
      .from("user_roles")
      .insert({ user_id: created.user.id, role: data.role });
    if (rErr) throw new Error(rErr.message);
    return { ok: true, userId: created.user.id };
  });

export const adminRemoveAccount = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => z.object({ userId: z.string().uuid() }).parse(i))
  .handler(async ({ data, context }) => {
    const roles = await requireAdmin(context.supabase, context.userId);
    if (!roles.includes("super_admin")) throw new Error("Forbidden: super admin only");
    if (data.userId === context.userId) throw new Error("You cannot remove yourself.");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin.from("user_roles").delete().eq("user_id", data.userId);
    const { error } = await supabaseAdmin.auth.admin.deleteUser(data.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

const updateRoleSchema = z.object({
  userId: z.string().uuid(),
  role: z.enum(["super_admin", "payment_manager", "support"]),
});

export const adminUpdateRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => updateRoleSchema.parse(i))
  .handler(async ({ data, context }) => {
    const roles = await requireAdmin(context.supabase, context.userId);
    if (!roles.includes("super_admin")) throw new Error("Forbidden: super admin only");
    if (data.userId === context.userId) throw new Error("You cannot change your own role.");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("user_roles")
      .update({ role: data.role })
      .eq("user_id", data.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

const resetPasswordSchema = z.object({
  userId: z.string().uuid(),
});

export const adminResetPassword = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => resetPasswordSchema.parse(i))
  .handler(async ({ data, context }) => {
    const roles = await requireAdmin(context.supabase, context.userId);
    if (!roles.includes("super_admin")) throw new Error("Forbidden: super admin only");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: linkData, error } = await supabaseAdmin.auth.admin.generateRecoveryLink(data.userId, "recovery");
    if (error) throw new Error(error.message);
    return { ok: true, link: linkData.properties?.action_link ?? null };
  });
