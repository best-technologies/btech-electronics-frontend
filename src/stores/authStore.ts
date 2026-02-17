import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { UserProfileData } from "@/lib/api/auth-api";

interface AuthState {
  accessToken: string | null;
  role: "user" | "admin" | null;
  userProfile: UserProfileData | null;
  /** True after persisted state has been rehydrated from storage (avoids redirect on reload). */
  _hasHydrated: boolean;
  setAuth: (accessToken: string, role: "user" | "admin") => void;
  setUserProfile: (profile: UserProfileData | null) => void;
  setHasHydrated: (value: boolean) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      role: null,
      userProfile: null,
      _hasHydrated: false,
      setAuth: (accessToken, role) => set({ accessToken, role }),
      setUserProfile: (userProfile) => set({ userProfile }),
      setHasHydrated: (value) => set({ _hasHydrated: value }),
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
      skipHydration: true,
      onRehydrateStorage: () => (_, err) => {
        if (!err) useAuthStore.getState().setHasHydrated(true);
      },
    }
  )
);

export const selectIsAuthenticated = (s: AuthState) => !!s.accessToken;

/** True after persist has rehydrated from storage. Use to avoid redirecting before token is loaded. */
export const selectHasHydrated = (s: AuthState): boolean => s._hasHydrated;

/** Current user's permission names (from profile). Empty if profile not loaded or no permissions. */
export const selectPermissions = (s: AuthState): string[] =>
  s.userProfile?.permissions ?? [];

/** Returns a selector that checks if the current user has the given permission name. */
export function selectHasPermission(permission: string) {
  return (s: AuthState): boolean =>
    (s.userProfile?.permissions?.includes(permission) ?? false);
}

/** Permission required to edit/onboard users. Backend may use "manage user" or "manage_user". */
export const PERMISSION_MANAGE_USER = "manage user";

/** Developer email(s): always allowed to manage users and edit permissions. Set via NEXT_PUBLIC_DEVELOPER_EMAIL. */
function getDeveloperEmail(): string {
  const raw =
    typeof process !== "undefined" && process.env?.NEXT_PUBLIC_DEVELOPER_EMAIL?.trim();
  const value = typeof raw === "string" ? raw : "bernardmayowaa@gmail.com";
  return value.toLowerCase();
}

/** True if the current user can edit users, edit user permissions, and onboard admins. */
export const selectHasManageUser = (s: AuthState): boolean => {
  const email = s.userProfile?.email?.toLowerCase();
  if (email && email === getDeveloperEmail()) return true;
  const perms = s.userProfile?.permissions ?? [];
  return perms.includes("manage users") || perms.includes("manage_users");
};

/** Permission required to create/edit invoices and record payments. */
export const PERMISSION_MANAGE_INVOICE = "manage invoice";

/** True if the current user can create invoices, record payments, and mark/unmark paid. */
export const selectHasManageInvoice = (s: AuthState): boolean => {
  const perms = s.userProfile?.permissions ?? [];
  return perms.includes("manage invoice") || perms.includes("manage_invoice");
};

/** Permission required to create, update, or delete consignments and their items. */
export const PERMISSION_MANAGE_CONSIGNMENT = "manage consignment";

/** True if the current user can perform CRUD on consignments (create, edit, add/edit/delete items). */
export const selectHasManageConsignment = (s: AuthState): boolean => {
  const perms = s.userProfile?.permissions ?? [];
  return perms.includes("manage consignment") || perms.includes("manage_consignment");
};

/** True if the current user can perform management operations on stocks. */
export const selectHasManageStock = (s: AuthState): boolean => {
  const perms = s.userProfile?.permissions ?? [];
  return perms.includes("manage stocks") || perms.includes("manage_stocks");
};

/** True if the current user can perform management operations on payments. */
export const selectHasManagePayment = (s: AuthState): boolean => {
  const perms = s.userProfile?.permissions ?? [];
  return perms.includes("manage payments") || perms.includes("manage_payments");
};

/** True if the current user has an "all" permission (can do everything). */
export const selectHasAllPermission = (s: AuthState): boolean => {
  const perms = s.userProfile?.permissions ?? [];
  return perms.some((p) => p.toLowerCase() === "all");
};
