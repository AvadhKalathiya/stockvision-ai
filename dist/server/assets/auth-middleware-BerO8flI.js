import { j as createMiddleware, z as getRequest } from "./server-Cgfy5VtR.js";
import { c as createClient } from "./index-ChW4vIqc.js";
const requireSupabaseAuth = createMiddleware({ type: "function" }).server(
  async ({ next }) => {
    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_PUBLISHABLE_KEY = process.env.SUPABASE_PUBLISHABLE_KEY;
    if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
      const missing = [
        ...!SUPABASE_URL ? ["SUPABASE_URL"] : [],
        ...!SUPABASE_PUBLISHABLE_KEY ? ["SUPABASE_PUBLISHABLE_KEY"] : []
      ];
      const message = `Missing Supabase environment variable(s): ${missing.join(", ")}. Please check your .env file.`;
      console.error(`[Supabase] ${message}`);
      throw new Error(message);
    }
    const request = getRequest();
    if (!request?.headers) {
      throw new Error("Unauthorized: No request headers available");
    }
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new Error("Unauthorized: No authorization header provided");
    }
    const token = authHeader.replace("Bearer ", "");
    if (!token) {
      throw new Error("Unauthorized: No token provided");
    }
    const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
      global: {
        headers: {
          Authorization: `Bearer ${token}`
        }
      },
      auth: {
        storage: void 0,
        persistSession: false,
        autoRefreshToken: false
      }
    });
    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data?.user) {
      throw new Error("Unauthorized: Invalid token");
    }
    if (!data.user.id) {
      throw new Error("Unauthorized: No user ID found in token");
    }
    return next({
      context: {
        supabase,
        userId: data.user.id,
        user: data.user
      }
    });
  }
);
export {
  requireSupabaseAuth as r
};
