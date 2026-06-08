/**
 * Admin auth server functions.
 * These run server-side only and use the SUPABASE_SERVICE_ROLE_KEY
 * to bypass email validation and confirmation requirements.
 *
 * NEVER import this file on the client side.
 */
import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

function getAdminClient() {
  const url = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey || serviceKey === "YOUR_SERVICE_ROLE_KEY_HERE") {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is not set. " +
        "Get it from: Dashboard → Settings → API → service_role (secret).",
    );
  }
  return createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export type CreateUserResult =
  | { status: "created"; userId: string; email: string }
  | { status: "exists"; userId: string; email: string }
  | { status: "error"; message: string };

/**
 * Creates a user via the Supabase Admin API.
 * - Bypasses email domain restrictions (gmail.com allowed)
 * - Bypasses email confirmation (auto-confirms the account)
 * - Idempotent: if user already exists, returns existing user info
 */
export const adminCreateUser = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      email: z.string().email(),
      password: z.string().min(6),
      name: z.string().optional(),
    }).parse,
  )
  .handler(async ({ data }): Promise<CreateUserResult> => {
    let admin;
    try {
      admin = getAdminClient();
    } catch (err) {
      return {
        status: "error",
        message: err instanceof Error ? err.message : "Admin client init failed",
      };
    }

    // Try to create the user
    const { data: created, error: createErr } = await admin.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true, // auto-confirm, no email needed
      user_metadata: { name: data.name ?? data.email.split("@")[0] },
    });

    if (!createErr && created.user) {
      return {
        status: "created",
        userId: created.user.id,
        email: created.user.email ?? data.email,
      };
    }

    // If user already exists, find and return them
    if (
      createErr?.message?.toLowerCase().includes("already registered") ||
      createErr?.message?.toLowerCase().includes("already been registered") ||
      createErr?.code === "23505"
    ) {
      const { data: list } = await admin.auth.admin.listUsers();
      const existing = list?.users?.find((u) => u.email === data.email);
      if (existing) {
        return { status: "exists", userId: existing.id, email: existing.email ?? data.email };
      }
    }

    return {
      status: "error",
      message: createErr?.message ?? "Unknown error creating user",
    };
  });

/**
 * Checks if a user exists by email and returns their confirmation status.
 */
export const adminCheckUser = createServerFn({ method: "POST" })
  .inputValidator(z.object({ email: z.string().email() }).parse)
  .handler(async ({ data }) => {
    let admin;
    try {
      admin = getAdminClient();
    } catch {
      return { exists: false, confirmed: false, error: "Service role key not configured" };
    }

    const { data: list } = await admin.auth.admin.listUsers();
    const user = list?.users?.find((u) => u.email === data.email);

    if (!user) return { exists: false, confirmed: false };
    return {
      exists: true,
      confirmed: !!user.email_confirmed_at,
      userId: user.id,
      createdAt: user.created_at,
    };
  });
