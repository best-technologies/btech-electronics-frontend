import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { UserProfileData } from "@/lib/api/auth-api";

interface AuthState {
  accessToken: string | null;
  role: "user" | "admin" | null;
  userProfile: UserProfileData | null;
  setAuth: (accessToken: string, role: "user" | "admin") => void;
  setUserProfile: (profile: UserProfileData | null) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      role: null,
      userProfile: null,
      setAuth: (accessToken, role) => set({ accessToken, role }),
      setUserProfile: (userProfile) => set({ userProfile }),
      clearAuth: () =>
        set({ accessToken: null, role: null, userProfile: null }),
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        accessToken: state.accessToken,
        role: state.role,
        // do not persist userProfile; fetch on load when token exists
      }),
    }
  )
);

export const selectIsAuthenticated = (s: AuthState) => !!s.accessToken;
