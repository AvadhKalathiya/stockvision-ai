import { create } from "zustand";
import { supabase } from "@/integrations/supabase/client";
import type { Session, User } from "@supabase/supabase-js";

interface Profile {
  id: string;
  name: string | null;
  email: string | null;
  plan: string;
  avatar_url: string | null;
}

interface AuthState {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  initialized: boolean;
  init: () => () => void;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  user: null,
  profile: null,
  loading: true,
  initialized: false,

  init: () => {
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      set({ session, user: session?.user ?? null });
      if (session?.user) {
        // Defer to avoid deadlock
        setTimeout(() => get().refreshProfile(), 0);
      } else {
        set({ profile: null });
      }
    });
    supabase.auth
      .getSession()
      .then(({ data }) => {
        set({
          session: data.session,
          user: data.session?.user ?? null,
          loading: false,
          initialized: true,
        });
        if (data.session?.user) get().refreshProfile();
      })
      .catch((err) => {
        console.error("[AuthStore] getSession failed:", err);
        set({ loading: false, initialized: true });
      });
    return () => sub.subscription.unsubscribe();
  },

  refreshProfile: async () => {
    const user = get().user;
    if (!user) return;
    const { data } = await supabase
      .from("profiles")
      .select("id,name,email,plan,avatar_url")
      .eq("id", user.id)
      .maybeSingle();
    if (data) {
      set({ profile: data as Profile });
    } else {
      // New user — DB trigger may not have fired yet; upsert a default profile
      console.log("[AuthStore] No profile found — creating default profile for", user.id);
      const defaultProfile = {
        id: user.id,
        name: user.user_metadata?.name ?? user.user_metadata?.full_name ?? user.email?.split("@")[0] ?? null,
        email: user.email ?? null,
        plan: "free",
        avatar_url: user.user_metadata?.avatar_url ?? null,
      };
      const { error } = await supabase.from("profiles").upsert(defaultProfile, { onConflict: "id" });
      if (!error) {
        set({ profile: defaultProfile as Profile });
      } else {
        console.error("[AuthStore] Failed to create default profile:", error.message);
        // Still set a local-only profile so UI doesn't crash
        set({ profile: defaultProfile as Profile });
      }
    }
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ session: null, user: null, profile: null });
  },
}));
