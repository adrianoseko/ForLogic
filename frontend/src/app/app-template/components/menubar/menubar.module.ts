import { NgModule, Injectable, InjectionToken, Inject } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Observable } from 'rxjs';

import { MenubarComponent } from './menubar.component';

import { MenubarModule as PrimeMenubarModule } from 'primeng/menubar';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';

// App configuration token to separate dev/prod configuration securely.
// In a real app, provide this from a platform-specific provider (environment files,
// server-rendered config, or a runtime JSON). Here we provide a runtime-derived
// conservative default: allow only same-origin and localhost in development.
export interface AppConfig {
  allowedOrigins: string[];
  production: boolean;
  apiBaseUrl: string;
}

export const APP_CONFIG = new InjectionToken<AppConfig>('app.config');

const defaultConfig: AppConfig = (() => {
  const host = typeof window !== 'undefined' && window.location ? window.location.hostname : 'localhost';
  const isLocal = host === 'localhost' || host === '127.0.0.1';
  return {
    allowedOrigins: isLocal ? [window.location.origin] : [window.location.origin],
    production: !isLocal,
    apiBaseUrl: (isLocal ? 'http://localhost:3000/api' : `${window.location.origin}/api`),
  };
})();

/**
 * Basic AuthService that manages JWTs (in memory/localStorage) and provides
 * role checks. This encapsulation makes it easier to swap storage strategies
 * (cookies with HttpOnly flags, secure storage, etc.) without touching components.
 *
 * Note: This is a small, self-contained implementation for demonstration.
 * In production, prefer using HttpOnly cookies set by the server for better XSS protection,
 * and refresh-token rotation for improved security.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly tokenKey = 'app_jwt_token';
  private readonly rolesKey = 'app_user_roles';

  constructor(@Inject(APP_CONFIG) private config: AppConfig, private router?: Router) {}

  setToken(token: string): void {
    try {
      localStorage.setItem(this.tokenKey, token);
    } catch (err) {
      // Fail silently on storage errors to avoid breaking UI.
      console.warn('Unable to persist token to localStorage', err);
    }
  }

  getToken(): string | null {
    try {
      return localStorage.getItem(this.tokenKey);
    } catch (err) {
      console.warn('Unable to read token from localStorage', err);
      return null;
    }
  }

  removeToken(): void {
    try {
      localStorage.removeItem(this.tokenKey);
      localStorage.removeItem(this.rolesKey);
    } catch (err) {
      console.warn('Unable to remove token from localStorage', err);
    }
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    return !!token;
  }

  setRoles(roles: string[] = []): void {
    try {
      localStorage.setItem(this.rolesKey, JSON.stringify(roles));
    } catch (err) {
      console.warn('Unable to persist roles to localStorage', err);
    }
  }

  getRoles(): string[] {
    try {
      const raw = localStorage.getItem(this.rolesKey);
      return raw ? JSON.parse(raw) : [];
    } catch (err) {
      console.warn('Unable to read roles from localStorage', err);
      return [];
    }
  }

  hasRole(required: string | string[]): boolean {
    const roles = this.getRoles();
    const requiredArray = Array.isArray(required) ? required : [required];
    return requiredArray.some(r => roles.includes(r));
  }

  /**
   * Convenience method to perform logout and redirect to a login route if provided.
   */
  logout(redirectUrl?: string): void {
    this.removeToken();
    if (redirectUrl && this.router) {
      this.router.navigate([redirectUrl]).catch(() => {});
    }
  }
}

/**
 * Route guard that enforces authentication and optional role-based access.
 * Usage: in route definition, add data: { roles: ['Admin'] }
 */
@Injectable({ providedIn: 'root' })
export class RoleGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | Observable<boolean> | Promise<boolean> {
    try {
      if (!this.auth.isAuthenticated()) {
        // Not authenticated -> redirect to login page (preserving requested URL is optional)
        this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } }).catch(() => {});
        return false;
      }

      const requiredRoles = route.data && route.data['roles'];
      if (!requiredRoles) {
        return true;
      }

      const allowed = this.auth.hasRole(requiredRoles);
      if (!allowed) {
        // Optionally redirect to unauthorized page
        this.router.navigate(['/unauthorized']).catch(() => {});
      }
      return allowed;
    } catch (err) {
      console.error('Error in RoleGuard.canActivate', err);
      return false;
    }
  }
}

@NgModule({
  imports: [
    // Keep BrowserModule and BrowserAnimationsModule here to avoid altering existing app bootstrap behavior.
    // In a larger refactor these should be provided once in AppModule and replaced with CommonModule here.
    BrowserModule,
    BrowserAnimationsModule,
    PrimeMenubarModule,
    InputTextModule,
    ButtonModule,
    RouterModule,
  ],
  declarations: [MenubarComponent],
  exports: [MenubarComponent],
  providers: [
    { provide: APP_CONFIG, useValue: defaultConfig },
    AuthService,
    RoleGuard,
  ],
  // Preserve bootstrap to avoid changing original module behavior where this module may be used as a root.
  bootstrap: [MenubarComponent],
})
export class MenubarModule {}
