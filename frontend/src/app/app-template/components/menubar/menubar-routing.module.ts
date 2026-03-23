import { NgModule, Injectable } from '@angular/core';
import { Routes, RouterModule, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { MenubarComponent } from './menubar.component';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

// A small utility type for decoded JWT payload we care about
interface IUserTokenPayload {
  roles?: string[];
  exp?: number;
  iat?: number;
  sub?: string;
  [key: string]: any;
}

/**
 * Decode a JWT without validating signature (useful on client to read claims such as roles or exp).
 * Returns null if token is invalid or cannot be parsed.
 */
function decodeJwt(token: string | null): IUserTokenPayload | null {
  if (!token) return null;
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = parts[1];
    // atob works for base64; replace URL-safe chars
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    // Pad base64 string
    const padded = base64.padEnd(base64.length + (4 - (base64.length % 4)) % 4, '=');
    const decoded = decodeURIComponent(
      atob(padded)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(decoded) as IUserTokenPayload;
  } catch (e) {
    // If parsing fails, return null; consumer will handle as unauthenticated
    return null;
  }
}

/**
 * Simple AuthGuard that checks for a JWT stored in localStorage under the 'auth_token' key.
 * - In development (environment.production === false) the guard is permissive to preserve DX.
 * - In production the guard will validate presence and expiry of the token and redirect to /login when missing/expired.
 *
 * Note: This is a lightweight client-only check. Real enforcement must occur server-side for security.
 */
@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> {
    // Preserve development behavior (no blocking) to avoid surprising changes during development.
    if (!environment.production) return true;

    const token = localStorage.getItem('auth_token');
    const payload = decodeJwt(token);

    const nowSeconds = Math.floor(Date.now() / 1000);
    const isValid = !!payload && (!payload.exp || payload.exp > nowSeconds);

    if (!isValid) {
      // Redirect to a login page (route should exist in the app). Using UrlTree avoids flicker.
      return this.router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
    }

    return true;
  }
}

/**
 * RoleGuard checks that the decoded token contains at least one of the required roles specified in route.data.roles.
 * If no roles are specified, the guard allows access (acts as a no-op role check).
 * Like AuthGuard, the guard is permissive in development to preserve behavior during local work.
 */
@Injectable({ providedIn: 'root' })
export class RoleGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> {
    // Preserve development behavior (no blocking) to avoid surprising changes during development.
    if (!environment.production) return true;

    const requiredRoles = (route.data && route.data.roles) as string[] | undefined;
    if (!requiredRoles || requiredRoles.length === 0) return true; // no role requirement

    const token = localStorage.getItem('auth_token');
    const payload = decodeJwt(token);
    const userRoles = (payload && payload.roles) || [];

    const hasRole = requiredRoles.some(r => userRoles.includes(r));

    if (!hasRole) {
      // Redirect to a not-authorized page; app should provide this route.
      return this.router.createUrlTree(['/not-authorized']);
    }

    return true;
  }
}

// Exported constant so other parts of the app (or backend config tooling) can consume the intended allowed origins.
// This helps ensure CORS policies are not 'AllowAll' in production.
export const ALLOWED_CORS_ORIGINS: string[] = environment.production
  ? ['https://your-production-domain.com']
  : ['http://localhost:4200'];

// Keep route definition clear and typed. The guards are applied only in production to preserve current dev behavior.
const menubarRoutes: Routes = [
  {
    path: 'menubar',
    component: MenubarComponent,
    // Provide role metadata so authorization policy is explicit and easy to adjust
    data: {
      // Example role required to view the menubar route. Adjust as needed by your backend policy.
      roles: ['User']
    },
    // Apply guards conditionally: in development they're intentionally omitted to preserve existing behavior.
    canActivate: environment.production ? [AuthGuard, RoleGuard] : [],
  },
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(menubarRoutes)],
  exports: [RouterModule],
  // Guards are providedIn: 'root' but keeping providers array explicit is harmless and documents intent.
  providers: [AuthGuard, RoleGuard],
})
export class MenubarRoutingModule {}
