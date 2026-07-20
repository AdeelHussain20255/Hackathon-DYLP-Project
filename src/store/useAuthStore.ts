import { create } from "zustand";
import { insforge } from "../lib/insforge";
import { setAccessToken } from "../api";

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

function syncAccessToken() {
  try {
    const token = (insforge.auth as any).tokenManager.getAccessToken();
    if (token) {
      setAccessToken(token);
      return token;
    }
  } catch {
  }
  return null;
}

export const useAuthStore = create<AuthState>((set) => {
  insforge.auth.onAuthStateChange(() => {
    syncAccessToken();
  });

  return {
    user: null,
    loading: true,
    accessToken: null,

    hydrate: async () => {
      try {
        const { data, error } = await insforge.auth.getCurrentUser();
        if (error || !data?.user) {
          set({ user: null, loading: false, accessToken: null });
          setAccessToken(null);
          return;
        }

        const u = data.user;
        const profile = (u as any).profile || {};
        const token = syncAccessToken();
        set({
          user: {
            id: u.id,
            email: u.email ?? "",
            name: profile.name || u.email?.split("@")[0] || "User",
            role: profile.role || "HR Recruiter",
            avatarUrl: profile.avatar_url || "",
          },
          accessToken: token,
          loading: false,
        });
      } catch {
        set({ user: null, loading: false, accessToken: null });
        setAccessToken(null);
      }
    },

    setUser: (user, accessToken) => {
      if (accessToken) setAccessToken(accessToken);
      set({ user, accessToken: accessToken ?? null });
    },

    signOut: async () => {
      await insforge.auth.signOut();
      setAccessToken(null);
      set({ user: null, accessToken: null });
    },
  };
});
