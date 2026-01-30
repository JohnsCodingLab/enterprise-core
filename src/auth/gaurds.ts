import { AuthError } from "../errors/auth-error.js";

export interface GuardContext {
  user?: {
    userId: string;
    role?: string;
    permissions?: string[];
  };
}

export function requireAuth() {
  return (ctx: GuardContext): void => {
    if (!ctx.user) {
      throw new AuthError("UNAUTHORIZED");
    }
  };
}

export function requireRole(role: string) {
  return (ctx: GuardContext): void => {
    if (!ctx.user) {
      throw new AuthError("UNAUTHORIZED");
    }

    if (ctx.user.role !== role) {
      throw new AuthError("UNAUTHORIZED");
    }
  };
}

export function requirePermission(permission: string) {
  return (ctx: GuardContext): void => {
    if (!ctx.user) {
      throw new AuthError("UNAUTHORIZED");
    }

    if (!ctx.user.permissions?.includes(permission)) {
      throw new AuthError("UNAUTHORIZED");
    }
  };
}
