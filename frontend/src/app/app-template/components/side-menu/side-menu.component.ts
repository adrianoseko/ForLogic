import { Component, OnInit, Injectable } from '@angular/core';
import { MenuItem } from 'primeng/api';

// Small, local enums and helper services are provided here to keep this
// single-file refactor self-contained while following DI patterns.
// In a real project these should be split into their own modules/files.
export enum UserRole {
  Admin = 'Admin',
  User = 'User',
  Guest = 'Guest'
}

@Injectable()
export class AuthService {
  private readonly tokenKey = 'app_token';

  constructor() {}

  // Persist JWT in localStorage with basic error handling
  saveToken(token: string): void {
    try {
      localStorage.setItem(this.tokenKey, token);
    } catch (err) {
      // Do not throw to avoid breaking UI flows; surface to logs instead
      // Server-side enforcement should still be relied upon for true security
      // (see developer instructions about controller-side auth/policies).
      // eslint-disable-next-line no-console
      console.error('AuthService.saveToken failed', err);
    }
  }

  clearToken(): void {
    try {
      localStorage.removeItem(this.tokenKey);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn('AuthService.clearToken failed', err);
    }
  }

  getToken(): string | null {
    try {
      return localStorage.getItem(this.tokenKey);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn('AuthService.getToken failed', err);
      return null;
    }
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    return !!token;
  }

  // Rudimentary JWT parsing to extract roles from payload if present.
  // This is client-side convenience only. Do not rely on this for security.
  getUserRoles(): UserRole[] {
    const token = this.getToken();
    if (!token) return [UserRole.Guest];

    try {
      const parts = token.split('.');
      if (parts.length < 2) return [UserRole.User];
      const payload = JSON.parse(atob(parts[1]));
      // Support multiple common shapes: roles: [], role: 'Admin'
      const rolesCandidate = payload?.roles ?? payload?.role ?? null;

      if (!rolesCandidate) return [UserRole.User];

      if (Array.isArray(rolesCandidate)) {
        return rolesCandidate.map((r: string) => (Object.values(UserRole).includes(r as UserRole) ? (r as UserRole) : UserRole.User));
      }

      if (typeof rolesCandidate === 'string') {
        const r = rolesCandidate as string;
        return [(Object.values(UserRole).includes(r as UserRole) ? (r as UserRole) : UserRole.User)];
      }

      return [UserRole.User];
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn('AuthService.getUserRoles failed parsing token', err);
      return [UserRole.Guest];
    }
  }

  hasRole(role: UserRole): boolean {
    try {
      const roles = this.getUserRoles();
      return roles.includes(role);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn('AuthService.hasRole failed', err);
      return false;
    }
  }
}

@Injectable()
export class RoleGuard {
  constructor(private readonly auth: AuthService) {}

  // Simple role check helpers are provided to be used by components
  // or route guards. This is not an Angular Router guard implementation,
  // but follows the same idea so it is easy to extract into a proper guard.
  canActivate(requiredRoles: UserRole[] = []): boolean {
    if (!this.auth.isAuthenticated()) return false;
    if (!requiredRoles || requiredRoles.length === 0) return true;
    return requiredRoles.some(role => this.auth.hasRole(role));
  }
}

@Component({
  selector: 'app-side-menu',
  templateUrl: './side-menu.component.html',
  styleUrls: ['./side-menu.component.scss'],
  // Provide lightweight local services so the component remains self-contained
  providers: [AuthService, RoleGuard]
})
export class SideMenuComponent implements OnInit {
  items: MenuItem[] = [];

  // Expose a few properties for templates or future logic
  isAuthenticated = false;
  userRoles: UserRole[] = [];

  // Allowed origins example. In prod this should be set via environment variables
  // and used server-side (CORS). Client-side we only keep it for configuration
  // and to help APIs choose correct endpoints in a secure way.
  private readonly allowedOrigins: string[];

  constructor(private readonly auth: AuthService, private readonly guard: RoleGuard) {
    // Distinguish dev vs prod by hostname. Replace production host with your real domain.
    const hostname = window?.location?.hostname ?? '';
    if (hostname.includes('localhost') || hostname === '127.0.0.1') {
      this.allowedOrigins = ['http://localhost:4200'];
    } else {
      // IMPORTANT: replace with your production front-end origin(s)
      this.allowedOrigins = ['https://app.example.com'];
    }
  }

  ngOnInit(): void {
    // Preserve original behavior: menu remains empty unless initialized
    // Keep auth data available for conditional UI in templates
    this.isAuthenticated = this.auth.isAuthenticated();
    this.userRoles = this.auth.getUserRoles();

    this.initializeMenuItems();
  }

  private initializeMenuItems(): void {
    // Original code left this as a placeholder. We keep that intention and
    // provide an opt-in helper method that can build role-aware menu items.
    // Behavior is preserved: items defaults to an empty array.

    // Example of how to build items securely (kept commented out to preserve behavior):
    // this.items = this.buildMenuItems();

    this.items = [];
  }

  // Helper to construct menu items with role-based filtering.
  // This does not run by default to preserve previous behavior, but is
  // available for developers to enable safely.
  private buildMenuItems(): MenuItem[] {
    const potentialItems: Array<MenuItem & { requiredRoles?: UserRole[] }> = [
      // Example entries (commented to preserve original behavior):
      // { label: 'Home', icon: 'pi pi-fw pi-home', routerLink: ['/'], requiredRoles: [UserRole.User] },
      // { label: 'Admin', icon: 'pi pi-fw pi-lock', routerLink: ['/admin'], requiredRoles: [UserRole.Admin] },
    ];

    // Filter items based on role guard
    return potentialItems
      .filter(item => {
        if (!item.requiredRoles || item.requiredRoles.length === 0) return true;
        return this.guard.canActivate(item.requiredRoles);
      })
      .map(({ requiredRoles, ...mi }) => mi as MenuItem);
  }
}
