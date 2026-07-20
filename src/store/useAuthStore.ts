import { create } from "zustand";
import { insforge } from "../lib/insforge";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: string;
  avatarUrl: string;
}

interface AuthState {
  user: AuthUser | null;
  loading: boolean;
  accessToken: string | null;
  hydrate: () => Promise<void>;
  setUser: (user: AuthUser | null, accessToken?: string | null) => void;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  loading: true,
  accessToken: null,

  hydrate: async () => {
    try {
      const { data, error } = await insforge.auth.getCurrentUser();
      if (error || !data?.user) {
        set({ user: null, loading: false, accessToken: null });
        return;
      }

      const u = data.user;
      const profile = (u as any).profile || {};
      set({
        user: {
          id: u.id,
          email: u.email ?? "",
          name: profile.name || u.email?.split("@")[0] || "User",
          role: profile.role || "HR Recruiter",
          avatarUrl: profile.avatar_url || "",
        },
        loading: false,
      });

      try {
        const sessionRes = await (insforge.auth as any).getSession();
        const token = sessionRes?.data?.session?.access_token || null;
        if (token) {
          set({ accessToken: token });
        }
      } catch {
        // getSession not available; token will be set after login
      }
    } catch {
      set({ user: null, loading: false, accessToken: null });
    }
  },

  setUser: (user, accessToken) => {
    set({ user, accessToken: accessToken ?? null });
  },

  signOut: async () => {
    await insforge.auth.signOut();
    set({ user: null, accessToken: null });
  },
}));
