import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

export interface JwtPayload {
  sub?: string;
  exp?: number;
  iat?: number;
  roles?: string[];
  [key: string]: any;
}

export interface UserProfile {
  id?: string;
  roles: string[];
  [key: string]: any;
}

/**
 * HomeService
 *
 * Responsibilities:
 * - Keep the original behavior (a lightweight injectable service provided in root)
 * - Provide safe, reusable helpers for client-side JWT auth handling and role checks
 * - Surface utilities to attach auth headers to outbound requests
 * - Validate environment CORS configuration (warn in prod when wildcard found)
 *
 * Notes:
 * - This service intentionally does not perform network operations directly. That keeps it
 *   lightweight and avoids introducing HttpClient coupling into consumers that don't need it.
 * - Token storage uses localStorage to preserve common browser behavior for SPA tokens.
 *   In production consider HttpOnly secure cookies for better protection against XSS.
 */
@Injectable({
  providedIn: 'root'
})
export class HomeService {
  private readonly tokenKey = 'auth_token';

  constructor() {
    // Validate environment configuration on creation to help catch insecure CORS config.
    // This is non-fatal: it logs clear warnings rather than throwing to avoid breaking
    // existing applications unexpectedly. The message guides developers to fix the env.
    this.validateCorsConfig();
  }

  // Preserve the original behaviour: service is lightweight and can be extended later.

  // ----------------------- Token storage helpers -----------------------

  setToken(token: string): void {
    if (!token) {
      return;
    }
    try {
      localStorage.setItem(this.tokenKey, token);
    } catch (err) {
      // localStorage might throw (e.g. storage disabled). Fail silently but keep app running.
      // Consumers can check isAuthenticated() to know token state.
      // eslint-disable-next-line no-console
      console.warn('Unable to persist auth token to localStorage', err);
    }
  }

  getToken(): string | null {
    try {
      return localStorage.getItem(this.tokenKey);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn('Unable to read auth token from localStorage', err);
      return null;
    }
  }

  clearToken(): void {
    try {
      localStorage.removeItem(this.tokenKey);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn('Unable to remove auth token from localStorage', err);
    }
  }

  // ----------------------- Authentication helpers -----------------------

  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) {
      return false;
    }
    const payload = this.parseJwt(token);
    if (!payload) {
      return false;
    }
    if (typeof payload.exp === 'number') {
      const isExpired = Date.now() >= payload.exp * 1000;
      if (isExpired) {
        // Clear expired token proactively
        this.clearToken();
        return false;
      }
    }
    return true;
  }

  /**
   * Parse a JWT and return its JSON payload or null when parsing fails.
   * This helper is defensive: it won't throw for malformed tokens.
   */
  parseJwt(token: string): JwtPayload | null {
    if (!token) {
      return null;
    }
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        return null;
      }
      const b64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
      // atob returns a binary string which may contain non-ASCII characters.
      // Convert safely into a UTF-8 string before JSON.parse.
      const bin = atob(b64);
      const utf8 = decodeURIComponent(
        Array.prototype.map
          .call(bin, (c: string) => {
            const code = c.charCodeAt(0).toString(16).padStart(2, '0');
            return '%' + code;
          })
          .join('')
      );
      return JSON.parse(utf8) as JwtPayload;
    } catch (err) {
      // Malformed token or decode error
      return null;
    }
  }

  getUserProfile(): UserProfile | null {
    const token = this.getToken();
    if (!token) {
      return null;
    }
    const payload = this.parseJwt(token);
    if (!payload) {
      return null;
    }

    const roles: string[] = Array.isArray(payload.roles)
      ? (payload.roles as string[])
      : payload.role
      ? [String(payload.role)]
      : [];

    return {
      id: payload.sub,
      roles,
      ...payload
    };
  }

  hasRole(role: string): boolean {
    if (!role) {
      return false;
    }
    const profile = this.getUserProfile();
    if (!profile) {
      return false;
    }
    return profile.roles.includes(role);
  }

  // ----------------------- Request helper -----------------------

  /**
   * Attach Authorization header (Bearer token) to a headers map.
   * Returns a new plain object with the Authorization header if a token is present.
   * This helps consumers avoid coupling to HttpClient and keeps the service testable.
   */
  attachAuthHeader(headers?: Record<string, string>): Record<string, string> {
    const result: Record<string, string> = { ...(headers || {}) };
    const token = this.getToken();
    if (token) {
      result['Authorization'] = `Bearer ${token}`;
    }
    return result;
  }

  // ----------------------- Environment / CORS validation -----------------------

  /**
   * Basic validation of environment CORS config.
   * - In production we warn if allowedOrigins are missing or include wildcard '*'.
   * - This does not change runtime behavior; it only surfaces warnings to developers.
   *
   * Note: the real CORS enforcement happens on the server. Frontend can only guide
   * configuration by checking build-time environment variables.
   */
  private validateCorsConfig(): void {
    try {
      if (!environment) {
        return;
      }
      if (environment.production) {
        const allowed = (environment as any).allowedOrigins as string[] | undefined;
        if (!Array.isArray(allowed) || allowed.length === 0) {
          // eslint-disable-next-line no-console
          console.warn(
            '[HomeService] production build with no environment.allowedOrigins configured. ' +
              'Please set environment.allowedOrigins to a list of allowed origins to avoid AllowAll CORS.'
          );
        } else if (allowed.includes('*')) {
          // eslint-disable-next-line no-console
          console.warn(
            "[HomeService] environment.allowedOrigins contains '*' in production which is insecure. " +
              'Set specific origins for production to avoid broad CORS exposure.'
          );
        }
      }
    } catch (err) {
      // Do not break the application when environment shape is unexpected.
      // eslint-disable-next-line no-console
      console.warn('[HomeService] Unable to validate CORS config', err);
    }
  }
}
