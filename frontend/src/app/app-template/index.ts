export * from './pages/home/home.module';
export * from './pages/login/login.module';
export * from './pages/select-modality/select-modality.module';

// Central barrel file for app-template related exports.
//
// Notes:
// - Preserve existing re-exports above to avoid changing public module surface area.
// - Add lightweight, frontend-side authentication helpers, role definitions, and
//   CORS-origin helpers so that the rest of the frontend has a single place to
//   import shared auth/CORS utilities. These helpers do NOT alter application
//   behavior by themselves; they are utility exports meant to be consumed by
//   route guards, services, or server configuration processes.
//
// Security guidance (important):
// - CORS must be enforced server-side. The frontend can provide a recommended
//   allow-list to the server or to deployment pipelines, but the server should
//   be the source of truth for CORS policies and role-based enforcement.
// - Use HttpOnly cookies or secure storage for tokens on production where
//   possible. This file contains client-side helpers and should not be relied
//   on as the sole protection mechanism.

// -------------------------
// Types and role definitions
// -------------------------
export enum Role {
  Admin = 'admin',
  User = 'user',
  Guest = 'guest'
}

export interface AuthTokenPayload {
  sub?: string; // subject / user id
  role?: string | string[];
  exp?: number; // expiry (unix seconds)
  iat?: number; // issued at (unix seconds)
  [key: string]: any;
}

// -------------------------
// Authentication helpers
// -------------------------
// NOTE: This is a minimal, framework-agnostic helper set. In a real app prefer
// to implement token storage using secure, HttpOnly cookies managed by the
// server or a dedicated authentication library.

const AUTH_TOKEN_KEY = 'app_auth_token_v1';

export class AuthService {
  // Store JWT in a safe, versioned key. Consider using cookies with HttpOnly
  // on production instead of localStorage.
  public static setToken(token: string | null): void {
    try {
      if (token === null) {
        localStorage.removeItem(AUTH_TOKEN_KEY);
        return;
      }
      localStorage.setItem(AUTH_TOKEN_KEY, token);
    } catch (error) {
      // LocalStorage may be unavailable in some environments; fail gracefully.
      // Do not throw to preserve existing app behavior.
      // eslint-disable-next-line no-console
      console.warn('AuthService: unable to set token', error);
    }
  }

  public static getToken(): string | null {
    try {
      return localStorage.getItem(AUTH_TOKEN_KEY);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.warn('AuthService: unable to read token', error);
      return null;
    }
  }

  public static clearToken(): void {
    this.setToken(null);
  }

  public static getPayload(): AuthTokenPayload | null {
    const token = this.getToken();
    if (!token) return null;
    return parseJwtSafe(token);
  }

  public static isAuthenticated(): boolean {
    const payload = this.getPayload();
    if (!payload) return false;
    if (payload.exp && typeof payload.exp === 'number') {
      const now = Math.floor(Date.now() / 1000);
      return payload.exp > now;
    }
    return true; // No exp claim present, assume valid token (preserve behaviour)
  }

  public static hasRole(required: Role | Role[] | string | string[]): boolean {
    const payload = this.getPayload();
    if (!payload) return false;

    const tokenRoles = normalizeRoles(payload.role);
    const requiredRoles = normalizeRoles(required);

    // If any required role is present in tokenRoles, grant access.
    return requiredRoles.some(r => tokenRoles.includes(r));
  }
}

function normalizeRoles(input: Role | Role[] | string | string[] | undefined): string[] {
  if (!input) return [];
  if (Array.isArray(input)) return input.map(String);
  return [String(input)];
}

function parseJwtSafe(token: string): AuthTokenPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length < 2) return null;
    const payload = parts[1];
    // Atob can throw if not base64url; replace URL-safe chars then decode.
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(json) as AuthTokenPayload;
  } catch (error) {
    // If parsing fails, return null and do not throw to preserve app behavior.
    // eslint-disable-next-line no-console
    console.warn('AuthService: failed to parse token payload', error);
    return null;
  }
}

// -------------------------
// HTTP helper for attaching auth headers
// -------------------------
export function createAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };

  const token = AuthService.getToken();
  if (token) {
    headers['Authorization'] = 'Bearer ' + token;
  }

  // XSRF protection note: Prefer framework-provided XSRF token handling (e.g. Angular's
  // HttpClientXsrfModule) and server-set cookies. This header placeholder exists
  // to show where such a token would be attached if used.
  // headers['X-XSRF-TOKEN'] = getXsrfToken();

  return headers;
}

// -------------------------
// Authorization helper for route guarding
// -------------------------
// Lightweight helper that returns a boolean; integrate with your framework's
// route guard interfaces (e.g. Angular CanActivate) where appropriate.
export function authorize(requiredRoles: Role | Role[] | string | string[]): boolean {
  // Deny if not authenticated
  if (!AuthService.isAuthenticated()) return false;
  // Check roles
  return AuthService.hasRole(requiredRoles);
}

// -------------------------
// CORS configuration helpers
// -------------------------
// IMPORTANT: CORS must be configured server-side. These helpers are provided
// so frontend and deployment scripts have a central recommended origin list
// and clear separation between dev and production settings.

const DEV_ORIGINS = ['http://localhost:4200'];

// Read allowed origins from a runtime-injected global (recommended) or from
// process.env (build-time). This keeps secret values out of the repo and
// avoids AllowAll in production builds.
function readRuntimeAllowedOrigins(): string[] {
  try {
    // Example patterns for runtime injection: window.__APP_CONFIG__ or similar.
    // If not provided, fall back to process.env (may be string CSV).
    // Keep this non-throwing to preserve app behavior.
    const win: any = typeof window !== 'undefined' ? window : null;
    if (win && win.__APP_CONFIG__ && Array.isArray(win.__APP_CONFIG__.allowedOrigins)) {
      return win.__APP_CONFIG__.allowedOrigins.slice();
    }

    const envVal = typeof process !== 'undefined' && process.env && process.env.ALLOWED_ORIGINS;
    if (envVal && typeof envVal === 'string') {
      return envVal.split(',').map(s => s.trim()).filter(Boolean);
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.warn('Unable to read runtime allowed origins', error);
  }
  return [];
}

export function getAllowedOrigins(env: string = (typeof process !== 'undefined' && process.env && process.env.NODE_ENV) || 'development'): string[] {
  const runtime = readRuntimeAllowedOrigins();
  if (runtime.length > 0) return runtime;

  if (env === 'production') {
    // In production do NOT return a wildcard. Return an explicit, empty list by
    // default so server/operator must set allowed origins.
    return [];
  }

  // Default to local development origins during development to keep DX smooth.
  return DEV_ORIGINS.slice();
}

// -------------------------
// Export convenience types/utilities
// -------------------------
export const Auth = {
  Role,
  AuthService,
  authorize,
  createAuthHeaders
};

export const Cors = {
  getAllowedOrigins,
  DEV_ORIGINS
};

// End of file
