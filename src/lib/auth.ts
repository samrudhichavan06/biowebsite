/**
 * Unified Authentication & RBAC System
 * Handles: Exhibitor, Visitor, Delegate, Fabricator, Admin
 */

export type UserRole = "exhibitor" | "visitor" | "delegate" | "fabricator" | "admin";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  companyName?: string;
  phone?: string;
  timestamp: number;
}

const AUTH_STORAGE_KEY = "bioenergy_auth_user";
const ROLE_STORAGE_KEY = "bioenergy_user_role";

// ============ Core Auth Functions ============

export function getCurrentUser(): AuthUser | null {
  const raw = sessionStorage.getItem(AUTH_STORAGE_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    clearAuth();
    return null;
  }
}

export function getCurrentRole(): UserRole | null {
  const user = getCurrentUser();
  return user?.role || null;
}

export function isAuthenticated(): boolean {
  return Boolean(getCurrentUser());
}

export function setAuthUser(user: AuthUser): void {
  sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
  sessionStorage.setItem(ROLE_STORAGE_KEY, user.role);
}

export function clearAuth(): void {
  sessionStorage.removeItem(AUTH_STORAGE_KEY);
  sessionStorage.removeItem(ROLE_STORAGE_KEY);
}

// ============ Role-Based Access Control ============

export const roleHierarchy: Record<UserRole, number> = {
  admin: 5,
  delegate: 4,
  fabricator: 3,
  exhibitor: 2,
  visitor: 1,
};

export function hasPermission(requiredRole: UserRole): boolean {
  const currentRole = getCurrentRole();
  if (!currentRole) return false;

  return roleHierarchy[currentRole] >= roleHierarchy[requiredRole];
}

export function hasAnyRole(roles: UserRole[]): boolean {
  const currentRole = getCurrentRole();
  return currentRole ? roles.includes(currentRole) : false;
}

// ============ Role-Specific Utilities ============

export function isExhibitor(): boolean {
  return getCurrentRole() === "exhibitor";
}

export function isVisitor(): boolean {
  return getCurrentRole() === "visitor";
}

export function isDelegate(): boolean {
  return getCurrentRole() === "delegate";
}

export function isFabricator(): boolean {
  return getCurrentRole() === "fabricator";
}

export function isAdmin(): boolean {
  return getCurrentRole() === "admin";
}

// ============ Admin Access ============

const ADMIN_USERNAME = import.meta.env.VITE_ADMIN_USERNAME || "admin";
const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || "BioEnergy@2026";

export function verifyAdminCredentials(username: string, password: string): boolean {
  return username === ADMIN_USERNAME && password === ADMIN_PASSWORD;
}

export function loginAsAdmin(username: string, password: string): boolean {
  if (!verifyAdminCredentials(username, password)) {
    return false;
  }

  const adminUser: AuthUser = {
    id: "admin",
    email: "admin@bioenergy.local",
    name: "Administrator",
    role: "admin",
    timestamp: Date.now(),
  };

  setAuthUser(adminUser);
  return true;
}

// ============ Session Management ============

export function updateUserProfile(updates: Partial<AuthUser>): void {
  const user = getCurrentUser();
  if (!user) return;

  const updated: AuthUser = {
    ...user,
    ...updates,
    id: user.id, // Prevent ID override
    role: user.role, // Prevent role override
  };

  setAuthUser(updated);
}

export function getSessionDuration(): number {
  const user = getCurrentUser();
  if (!user) return 0;
  return Date.now() - user.timestamp;
}
