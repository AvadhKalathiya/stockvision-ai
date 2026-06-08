import { c as createClient } from "./index-ChW4vIqc.js";
function createSupabaseClient() {
  const SUPABASE_URL = "https://ncqohgdhosfsidqnwlaf.supabase.co";
  const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5jcW9oZ2Rob3Nmc2lkcW53bGFmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk1MTI4ODUsImV4cCI6MjA5NTA4ODg4NX0.EFHSjg8tgzgF52Q-QfzwZIvvWb1kF3mi-ZFJR1sSIB4";
  return createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    auth: {
      storage: typeof window !== "undefined" ? localStorage : void 0,
      persistSession: true,
      autoRefreshToken: true
    }
  });
}
let _supabase;
const supabase = new Proxy({}, {
  get(_, prop, receiver) {
    if (!_supabase) _supabase = createSupabaseClient();
    return Reflect.get(_supabase, prop, receiver);
  }
});
export {
  supabase as s
};
