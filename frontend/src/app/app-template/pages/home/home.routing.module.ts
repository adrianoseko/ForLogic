import { NgModule, Injectable } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  RouterModule,
  Routes,
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
  Route
} from '@angular/router';
import { HomeComponent } from './home.component';
import { environment } from 'src/environments/environment';

// Note on CORS: Allowed origins are primarily a backend concern. We expose the known
// allowed origins here (fed from environment files) so frontend code can be aware
// (for example, for debug/logging or pre-flight checks). Ensure backend enforces
// CORS properly in production and does NOT use AllowAll. Example values live in
// src/environments/*.ts and must differ for dev and prod.
const ALLOWED_ORIGINS: string[] = environment.allowedOrigins || [ 'http://localhost:4200' ];

// Toggle enforcement from environment. Default to false to preserve current open behavior
// unless explicitly enabled in environment.production or a specific flag.
const ENFORCE_AUTH: boolean = !!environment.enforceAuth;

interface JwtPayload {
  exp?: number;
  iat?: number;
  sub?: string;
  roles?: string[];
  [key: string]: any;
}

@Injectable({ providedIn: 'root' })
class JwtService {
  private tokenKey = 'access_token';

  isAuthenticated(): boolean {
    if (!ENFORCE_AUTH) {
      // Keep behavior unchanged in environments that don't enforce auth
      return true;
    }

    const token = this.getToken();
    if (!token) {
      return false;
    }

    const payload = this.decodePayload(token);
    if (!payload) {
      return false;
    }

    if (payload.exp && typeof payload.exp === 'number') {
      const nowSec = Math.floor(Date.now() / 1000);
      return payload.exp > nowSec;
    }

    // If there is no exp, consider token valid (preserve compatibility). Backends
    // should provide exp for security.
    return true;
  }

  getRoles(): string[] {
    const token = this.getToken();
    const payload = token ? this.decodePayload(token) : null;
    if (!payload) {
      return [];
    }
    const roles = payload.roles;
    if (Array.isArray(roles)) return roles;
    if (typeof roles === 'string') return [roles];
    return [];
  }

  private getToken(): string | null {
    try {
      const fromStorage = localStorage.getItem(this.tokenKey);
      if (fromStorage) return fromStorage;
    } catch (err) {
      // localStorage may be unavailable in some contexts (SSR, privacy modes)
    }
    return this.getCookie(this.tokenKey);
  }

  private getCookie(name: string): string | null {
    try {
      const cookie = document.cookie
        .split(';')
        .map(c => c.trim())
        .find(c => c.startsWith(name + '='));
      if (!cookie) return null;
      return decodeURIComponent(cookie.split('=')[1] || '');
    } catch (err) {
      return null;
    }
  }

  private decodePayload(token: string): JwtPayload | null {
    try {
      const parts = token.split('.');
      if (parts.length < 2) return null;
      const payload = parts[1];
      // Replace URL-safe chars and pad base64 if necessary
      const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
      const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
      const decoded = atob(padded);
      return JSON.parse(decoded) as JwtPayload;
    } catch (err) {
      return null;
    }
  }
}

@Injectable({ providedIn: 'root' })
class AuthGuard implements CanActivate {
  constructor(private jwt: JwtService, private router: Router) {}

  canActivate(_route: ActivatedRouteSnapshot, _state: RouterStateSnapshot): boolean {
    // If enforcement is disabled we allow navigation to keep original behavior
    if (!ENFORCE_AUTH) return true;

    if (this.jwt.isAuthenticated()) return true;

    // Not authenticated: redirect to a login page if present. This preserves
    // a reasonable UX in environments that enable auth enforcement.
    try {
      this.router.navigate(['/login']);
    } catch (err) {
      // If navigation fails, simply block activation
    }
    return false;
  }
}

@Injectable({ providedIn: 'root' })
class RoleGuard implements CanActivate {
  constructor(private jwt: JwtService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, _state: RouterStateSnapshot): boolean {
    if (!ENFORCE_AUTH) return true;

    const required: string[] = (route.data && route.data.roles) || [];
    if (required.length === 0) return true; // no roles required

    const userRoles = this.jwt.getRoles();
    const allowed = required.some(r => userRoles.includes(r));
    if (allowed) return true;

    // Not authorized: optionally navigate to an unauthorized page
    try {
      this.router.navigate(['/unauthorized']);
    } catch (err) {
      // swallow navigation errors to avoid breaking activation flow
    }
    return false;
  }
}

// Build routes while preserving original behavior. If ENFORCE_AUTH is true,
// apply AuthGuard and RoleGuard with a default policy (example role 'User').
// Otherwise keep the route open as before.
const homeRoute: Route = {
  path: 'home',
  component: HomeComponent
};

if (ENFORCE_AUTH) {
  homeRoute.canActivate = [AuthGuard, RoleGuard];
  homeRoute.data = { roles: ['User'] };
}

const homeRoutes: Routes = [homeRoute];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(homeRoutes)],
  exports: [RouterModule],
  providers: [JwtService, AuthGuard, RoleGuard]
})
export class HomeRoutingModule {}
