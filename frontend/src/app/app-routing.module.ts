import { NgModule, Injectable } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  Routes,
  RouterModule,
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  UrlTree,
  Router,
} from '@angular/router';

/**
 * Lightweight types for decoded JWT payload when present.
 */
interface JwtPayload {
  sub?: string;
  exp?: number;
  iat?: number;
  roles?: string[];
  [key: string]: any;
}

/**
 * Decode a JWT payload in a safe manner. Returns null if token is malformed.
 */
function decodeJwtPayload(token: string | null): JwtPayload | null {
  if (!token) return null;
  try {
    const parts = token.split('.');
    if (parts.length < 2) return null;
    const payload = parts[1];
    // Add padding if missing
    const padded = payload.padEnd(payload.length + (4 - (payload.length % 4)) % 4, '=');
    const decoded = atob(padded.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decoded) as JwtPayload;
  } catch (err) {
    // If decoding fails, return null so callers can handle unauthenticated state.
    return null;
  }
}

/**
 * AuthService manages token storage and basic role lookup.
 * It is intentionally frontend-only: real authentication, token issuance and
 * CORS protection must be enforced by the backend.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly storageKey = 'auth_token';

  constructor(private router?: Router) {}

  getToken(): string | null {
    try {
      return localStorage.getItem(this.storageKey);
    } catch (err) {
      // localStorage might be unavailable in some contexts; treat as unauthenticated
      return null;
    }
  }

  setToken(token: string): void {
    try {
      localStorage.setItem(this.storageKey, token);
    } catch (err) {
      // Best-effort: if storage fails, fallback is to not store token.
      // Do not throw so UI can display appropriate message instead.
      console.error('Failed to persist auth token', err);
    }
  }

  clearToken(): void {
    try {
      localStorage.removeItem(this.storageKey);
    } catch (err) {
      // ignore
    }
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;

    const payload = decodeJwtPayload(token);
    if (!payload) return false;

    if (payload.exp && typeof payload.exp === 'number') {
      const now = Math.floor(Date.now() / 1000);
      return payload.exp > now;
    }

    // If there's no exp claim, consider token valid (can't verify) — caller may choose stricter checks.
    return true;
  }

  getUserRoles(): string[] {
    const token = this.getToken();
    const payload = decodeJwtPayload(token);
    if (!payload) return [];
    const roles = payload.roles || payload['role'] || payload['roles[]'];
    if (Array.isArray(roles)) return roles as string[];
    if (typeof roles === 'string') return roles.split(',').map(r => r.trim());
    return [];
  }

  /**
   * Perform a local logout and optionally navigate to login screen.
   */
  logout(redirectToLogin = true): void {
    this.clearToken();
    if (redirectToLogin && this.router) {
      this.router.navigate(['/login']);
    }
  }
}

/**
 * Guard that enforces authentication. If not authenticated, navigates to /login.
 */
@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(
    _route: ActivatedRouteSnapshot,
    _state: RouterStateSnapshot
  ): boolean | UrlTree {
    if (this.auth.isAuthenticated()) return true;
    // Redirect users to login if not authenticated.
    return this.router.parseUrl('/login');
  }
}

/**
 * Guard that enforces role-based access control. Requires that the route
 * defines a data.roles array of permitted role strings.
 */
@Injectable({ providedIn: 'root' })
export class RoleGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean | UrlTree {
    const requiredRoles = route.data && (route.data['roles'] as string[] | undefined);
    if (!requiredRoles || requiredRoles.length === 0) {
      // No roles required, allow access (this guard can be applied to document intent)
      return true;
    }

    const userRoles = this.auth.getUserRoles();
    const hasRole = requiredRoles.some(r => userRoles.includes(r));

    if (hasRole) return true;

    // If user is not authorized, redirect to home (preserve UX). In some apps you might show 403.
    return this.router.parseUrl('/home');
  }
}

/**
 * Environment configuration provider.
 * NOTE: CORS must be configured server-side. This client-side constant helps ensure the app
 * only attempts requests to allowed origins when in production, but is NOT a security boundary.
 */
export class EnvironmentConfig {
  readonly production: boolean;
  readonly allowedOrigins: string[];

  constructor() {
    // Look for a runtime-configured global. This allows different deployments without bundling secrets.
    const runtime = (window as any).__env || {};
    this.production = Boolean(runtime.production) || false;

    if (this.production) {
      // In production, populate this from a deployment-time safe source (do NOT hardcode AllowAll here).
      this.allowedOrigins = Array.isArray(runtime.allowedOrigins) && runtime.allowedOrigins.length
        ? runtime.allowedOrigins
        : [window.location.origin];
    } else {
      // Local development: allow localhost by default
      this.allowedOrigins = runtime.allowedOrigins || ['http://localhost:4200'];
    }
  }
}

export const AppEnvironment = new EnvironmentConfig();

// Preserve existing routing behavior exactly: these routes simply redirect to themselves or other paths.
const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', redirectTo: '/login', pathMatch: 'full' },
  { path: 'home', redirectTo: '/home', pathMatch: 'full' },
  { path: 'menu', redirectTo: '/menu', pathMatch: 'full' },
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forRoot(routes, {
      useHash: true,
      relativeLinkResolution: 'legacy',
    }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}

/**
 * Export helpers so other modules can wire guards into real routes.
 * The file preserves behavior of existing routes while providing
 * infrastructure for authentication and authorization in the app.
 */
export const AuthHelpers = {
  AuthService,
  AuthGuard,
  RoleGuard,
  AppEnvironment,
};
