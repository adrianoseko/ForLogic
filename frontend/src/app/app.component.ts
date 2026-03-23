import { Component, OnInit, Injectable } from '@angular/core';
import { HttpClient, HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

export enum Role {
  Admin = 'admin',
  User = 'user',
  Guest = 'guest'
}

/**
 * Minimal JWT-based authentication service.
 * - Stores token in localStorage
 * - Exposes helpers to check authentication and roles
 * - Provides a secureFetch wrapper that attaches Authorization header
 *
 * Note: The HTTP endpoints, error handling policy and routing/guarding should be
 * wired into the app module and backend. This class intentionally keeps a
 * lightweight, well-typed, and testable surface.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private tokenSubject: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(this.getTokenFromStorage());

  constructor(private readonly http: HttpClient) {}

  // Current token value (synchronous access)
  public get token(): string | null {
    return this.tokenSubject.value;
  }

  // Observable token stream if consumers need to subscribe
  public token$(): Observable<string | null> {
    return this.tokenSubject.asObservable();
  }

  private getTokenFromStorage(): string | null {
    try {
      return localStorage.getItem('auth_token');
    } catch (err) {
      // localStorage may throw in some environments - fail gracefully
      console.error('Error reading token from storage', err);
      return null;
    }
  }

  private setToken(token: string | null): void {
    try {
      if (token) {
        localStorage.setItem('auth_token', token);
        this.tokenSubject.next(token);
      } else {
        localStorage.removeItem('auth_token');
        this.tokenSubject.next(null);
      }
    } catch (err) {
      console.error('Error updating token in storage', err);
    }
  }

  /**
   * Performs login against a backend. Returns true on success.
   * The request shape is conservative and should be adapted to your backend.
   */
  public login(username: string, password: string): Observable<boolean> {
    return this.http.post<{ token: string }>('/api/auth/login', { username, password }).pipe(
      tap(response => {
        if (response && response.token) {
          this.setToken(response.token);
        }
      }),
      map(response => !!(response && response.token)),
      catchError(err => {
        console.error('Login failed', err);
        // Return a safe fallback observable to preserve behavior
        return of(false);
      })
    );
  }

  public logout(): void {
    this.setToken(null);
    // Optionally notify backend about logout; omitted to preserve side-effect free default behavior
  }

  public isAuthenticated(): boolean {
    return !!this.token;
  }

  public getRoles(): string[] {
    const token = this.token;
    if (!token) {
      return [];
    }

    try {
      const parts = token.split('.');
      if (parts.length < 2) {
        return [];
      }
      const payload = JSON.parse(atob(parts[1]));
      if (!payload) {
        return [];
      }
      // Support common shapes: { roles: ['role1'] } or { role: 'role1' }
      if (Array.isArray(payload.roles)) {
        return payload.roles;
      }
      if (typeof payload.role === 'string') {
        return [payload.role];
      }
      return [];
    } catch (err) {
      console.error('Failed to parse token payload for roles', err);
      return [];
    }
  }

  public hasRole(role: Role | string): boolean {
    const roles = this.getRoles();
    return roles.includes(String(role));
  }

  /**
   * Helper to perform a GET request with Authorization header if a token is present.
   * This is a minimal convenience wrapper; use HttpInterceptor for global attachment.
   */
  public secureFetch<T>(url: string, options?: { headers?: HttpHeaders }): Observable<T> {
    let headers = options?.headers ?? new HttpHeaders();
    if (this.token) {
      headers = headers.set('Authorization', `Bearer ${this.token}`);
    }
    return this.http.get<T>(url, { headers }).pipe(
      catchError(err => {
        console.error('Secure fetch failed', err);
        return throwError(err);
      })
    );
  }
}

/**
 * HTTP interceptor that attaches the Authorization header when a token exists.
 * To apply it globally, register it in AppModule providers with multi: true.
 */
@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private readonly authService: AuthService) {}

  public intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.authService.token;
    if (!token) {
      return next.handle(req);
    }

    const cloned = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
    return next.handle(cloned);
  }
}

/**
 * Root application component.
 * Behavior preserved: sets the same title string as before.
 */
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  public title: string = 'angularproj';

  constructor(private readonly authService: AuthService) {}

  public ngOnInit(): void {
    // Intentionally minimal: preserve original behavior.
    // Application-level auth initialization can be performed here if desired,
    // e.g. silent refresh or token validation.
  }

  // Expose small helpers so templates can bind to auth state if needed later.
  public get isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }

  public hasRole(role: Role | string): boolean {
    return this.authService.hasRole(role);
  }
}

/*
  Notes for backend/CORS and environment configuration (do not keep AllowAll in production):
  - Configure allowed origins on the server side, using environment-specific settings.
  - In development you may allow localhost origins; in production only allow trusted domains.
  - Keep secrets and CORS whitelists out of source control and inject them through secure configuration.
*/