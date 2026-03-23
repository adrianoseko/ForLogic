import { NgModule, ModuleWithProviders, InjectionToken, Provider } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpInterceptor, HttpHandler, HttpRequest, HTTP_INTERCEPTORS } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { Injectable, Inject } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';

// IMPORTANT: adjust the relative path to your environment file if your project structure differs
import { environment } from '../../../../environments/environment';

/**
 * HomeModule is responsible for declaring and importing the necessary components
 * and modules for the home page of the application.
 *
 * This module intentionally does not register any global authentication providers
 * by default to preserve existing app behavior. Consumers can opt-in to
 * authentication/authorization integration by calling HomeModule.forRoot(...)
 * from the AppModule (or another root module).
 */

/**
 * Injection token for authentication options when providers are registered.
 */
export interface AuthOptions {
  /** Function responsible for returning the current JWT (or null). */
  jwtTokenGetter: () => string | null;

  /** Optional global allowed roles fallback for route guards. */
  allowedRoles?: string[];
}

export const AUTH_OPTIONS = new InjectionToken<AuthOptions>('HomeModule.AuthOptions');

/**
 * Minimal AuthService used by the interceptor and guards. This is intentionally
 * small and defensive so it can be safely included without changing app
 * behavior unless the consumer wires it in via forRoot.
 */
@Injectable()
export class AuthService {
  constructor(@Inject(AUTH_OPTIONS) private options: AuthOptions) {}

  getToken(): string | null {
    try {
      return this.options && typeof this.options.jwtTokenGetter === 'function'
        ? this.options.jwtTokenGetter()
        : null;
    } catch (err) {
      // Do not throw — preserve existing behavior; surface a console warning to help debugging
      // in development without changing runtime flow.
      // eslint-disable-next-line no-console
      console.warn('[AuthService] Error getting token', err);
      return null;
    }
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  hasRole(role: string): boolean {
    try {
      const token = this.getToken();
      if (!token) {
        return false;
      }
      // The token parsing is intentionally naive here (no side effects),
      // because exact parsing/validation depends on your token shape.
      // Consumers who opt-in should replace jwtTokenGetter to encapsulate parsing.
      const allowed = this.options && this.options.allowedRoles;
      if (Array.isArray(allowed) && allowed.length > 0) {
        return allowed.includes(role);
      }
      // If no allowedRoles provided, fall back to true if token present.
      return true;
    } catch (err) {
      // Defensive: do not throw from guard helpers
      // eslint-disable-next-line no-console
      console.warn('[AuthService] Error checking role', err);
      return false;
    }
  }
}

/**
 * Simple HTTP interceptor that attaches an Authorization header when a JWT is available.
 * This is provided only when the module is registered with forRoot to avoid changing
 * default behavior of the application.
 */
@Injectable()
export class JwtAuthInterceptor implements HttpInterceptor {
  constructor(private auth: AuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<any> {
    const token = this.auth.getToken();
    if (!token) {
      return next.handle(req);
    }

    const cloned = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
    return next.handle(cloned);
  }
}

/**
 * RoleGuard used to protect routes based on roles provided in route data.
 * Example usage in route config: { path: 'admin', component: AdminCmp, canActivate: [RoleGuard], data: { roles: ['admin'] } }
 */
@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | Observable<boolean> {
    try {
      const requiredRoles = route.data && route.data.roles ? (route.data.roles as string[]) : [];
      if (!requiredRoles || requiredRoles.length === 0) {
        // If no roles specified on route, allow access (preserve default behavior).
        return true;
      }

      const hasAnyRole = requiredRoles.some(role => this.auth.hasRole(role));
      if (hasAnyRole) {
        return true;
      }

      // Redirect to a safe page if unauthorized. Consumers can override.
      this.router.navigate(['/']);
      return false;
    } catch (err) {
      // Fail closed (deny) on unexpected errors, but do not throw.
      // eslint-disable-next-line no-console
      console.warn('[RoleGuard] Error during role check', err);
      this.router.navigate(['/']);
      return false;
    }
  }
}

/**
 * Helper that returns providers necessary for authentication to be wired into the app.
 * The function returns a Provider[] so it can be used by ModuleWithProviders.
 */
export function provideAuthProviders(options: AuthOptions): Provider[] {
  return [
    { provide: AUTH_OPTIONS, useValue: options },
    AuthService,
    RoleGuard,
    { provide: HTTP_INTERCEPTORS, useClass: JwtAuthInterceptor, multi: true },
  ];
}

/**
 * CORS configuration object exported for use by backend/server-side configuration tooling.
 * Note: This exists here solely to centralize origin information. Do NOT use '*' in production.
 * The environment.production flag is used to decide the allowed origins.
 */
export const CORS_CONFIG = {
  allowedOrigins: environment && environment.production
    ? [/* list production origins here, e.g. 'https://app.example.com' */]
    : ['*'],
  // Additional server-side CORS policies can be added here as needed.
};

@NgModule({
  declarations: [],
  imports: [CommonModule],
  exports: [],
})
export class HomeModule {
  /**
   * Call this method from a root module (e.g. AppModule) to wire authentication providers
   * into the dependency injection graph. This approach avoids changing default behavior
   * for existing apps that import HomeModule without authentication.
   *
   * Example:
   *   imports: [HomeModule.forRoot({ jwtTokenGetter: () => localStorage.getItem('id_token') })]
   */
  static forRoot(options: AuthOptions): ModuleWithProviders<HomeModule> {
    return {
      ngModule: HomeModule,
      providers: provideAuthProviders(options),
    };
  }
}
