import { NgModule, Injectable } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

/**
 * Module for the Login feature.
 *
 * This module intentionally remains lightweight and focused on the "login" feature surface.
 * Utility classes (AuthService, AuthGuard) are provided as root-level injectables so they
 * can be reused across the application without coupling them to this module's injector.
 *
 * Important notes for developers (server/backend):
 * - Implement JWT issuance, secure cookie flags (HttpOnly, Secure, SameSite) or use Authorization
 *   headers on the server side. Frontend-only measures are NOT sufficient to secure tokens.
 * - Enforce CORS on the server. In production restrict allowed origins to known origins;
 *   use separate dev/prod server configuration files or environment variables. Do NOT use
 *   AllowAll in production.
 * - Implement role-based authorization policies on controllers/endpoints on the server side.
 */

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly tokenKey = 'auth_token';

  /**
   * Persist a JWT (or token) in a storage safe for your platform (localStorage used here).
   * In SSR or stricter security contexts you might use cookies with HttpOnly and Secure flags instead.
   */
  login(token: string): void {
    try {
      localStorage.setItem(this.tokenKey, token);
    } catch (err) {
      // Do not throw; fail gracefully and log for diagnostics.
      // Real applications should surface this to monitoring.
      // Keep behavior unchanged for callers.
      // eslint-disable-next-line no-console
      console.error('AuthService.login: failed to store token', err);
    }
  }

  logout(): void {
    try {
      localStorage.removeItem(this.tokenKey);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('AuthService.logout: failed to remove token', err);
    }
  }

  getToken(): string | null {
    try {
      return localStorage.getItem(this.tokenKey);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('AuthService.getToken: failed to read token', err);
      return null;
    }
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  /**
   * Decode and return JWT payload, if any. This is a best-effort approach and does not validate signature.
   */
  getUserPayload(): any | null {
    const token = this.getToken();
    if (!token) return null;

    const parts = token.split('.');
    if (parts.length < 2) return null;

    try {
      // atob is available in browsers. In environments without atob you should provide a polyfill.
      const payloadJson = atob(parts[1]);
      return JSON.parse(payloadJson);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('AuthService.getUserPayload: failed to parse token payload', err);
      return null;
    }
  }

  getUserRoles(): string[] {
    const payload = this.getUserPayload();
    if (!payload) return [];

    const roles = payload.roles ?? payload.role ?? [];
    if (Array.isArray(roles)) return roles.map(String);
    return [String(roles)];
  }

  hasRole(expected: string): boolean {
    if (!expected) return false;
    return this.getUserRoles().some((r) => r === expected);
  }
}

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private readonly auth: AuthService, private readonly router: Router) {}

  /**
   * Guard that ensures the user is authenticated and optionally has one of the required roles.
   * To use: add data: { roles: ['Admin', 'User'] } on the route configuration.
   */
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    if (!this.auth.isAuthenticated()) {
      // Preserve return url for post-login redirect.
      // Keep behavior deterministic and side-effect free other than navigation.
      this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
      return false;
    }

    const expectedRoles = (route.data && (route.data['roles'] as string[] | undefined)) || undefined;
    if (expectedRoles && expectedRoles.length > 0) {
      const allowed = expectedRoles.some((role) => this.auth.hasRole(role));
      if (!allowed) {
        this.router.navigate(['/unauthorized']);
        return false;
      }
    }

    return true;
  }
}

@NgModule({
  declarations: [],
  imports: [CommonModule],
  exports: []
})
export class LoginModule {}
