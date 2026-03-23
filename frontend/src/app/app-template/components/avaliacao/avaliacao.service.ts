import { Injectable } from '@angular/core';
import { Observable, throwError, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

/**
 * Service responsible for Avaliacao-related API calls.
 *
 * Notes on authentication/authorization:
 * - If a JWT is present in localStorage under the key 'auth_token', this service will
 *   attach it as a Bearer token on outgoing requests.
 * - If roles are present in localStorage under the key 'user_roles' (JSON array), and
 *   a method declares required roles, the service will enforce them. Enforcement is
 *   conditional: if no token is present, calls proceed as before (backwards compatible).
 *
 * This preserves existing behavior while enabling JWT + role based checks when the
 * frontend has authentication information available.
 */
@Injectable({
  providedIn: 'root',
})
export class AvaliacaoService {
  private readonly baseApiUrl: string = environment.baseApiUrl;
  private readonly contentTypeHeader = 'application/json; charset=utf-8';

  constructor(private http: HttpClient) {
    // Basic environment sanity check to catch insecure configurations early.
    if (environment.production && this.baseApiUrl.includes('localhost')) {
      // Do not change behavior; only warn in console for maintainers.
      // In production, ensure CORS and base URL are configured securely on the server.
      // eslint-disable-next-line no-console
      console.warn('Production build is using a localhost baseApiUrl. Verify production configuration.');
    }
  }

  // ---------------------- Public API ----------------------
  getAvaliacao(): Observable<any> {
    // Allowed roles when JWT is present. If no JWT, call proceeds (backwards compatible).
    const authCheck = this.ensureAuthorized(['Admin', 'User']);
    if (this.isObservableError(authCheck)) return authCheck;

    const headers = this.buildHeaders();
    return this.http
      .get<any>(`${this.baseApiUrl}/Avaliacao`, { headers })
      .pipe(catchError(err => this.handleError(err)));
  }

  getClientes(): Observable<any> {
    const authCheck = this.ensureAuthorized(['Admin', 'User']);
    if (this.isObservableError(authCheck)) return authCheck;

    const headers = this.buildHeaders();
    return this.http
      .get<any>(`${this.baseApiUrl}/Client`, { headers })
      .pipe(catchError(err => this.handleError(err)));
  }

  postAvaliacao(form: any): Observable<any> {
    // Posting an Avaliacao typically requires elevated permissions when authenticated.
    const authCheck = this.ensureAuthorized(['Admin']);
    if (this.isObservableError(authCheck)) return authCheck;

    const headers = this.buildHeaders();
    return this.http
      .post<any>(`${this.baseApiUrl}/Avaliacao`, form, { headers })
      .pipe(catchError(err => this.handleError(err)));
  }

  // ---------------------- Helpers ----------------------
  private createBaseHeaders(): HttpHeaders {
    return new HttpHeaders({ 'Content-Type': this.contentTypeHeader });
  }

  /**
   * Builds headers for requests. If a JWT exists in localStorage, it will attach it
   * as a Bearer token.
   */
  private buildHeaders(): HttpHeaders {
    let headers = this.createBaseHeaders();
    const token = this.getToken();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  }

  /**
   * Ensures caller is authorized for a resource when authentication information is present.
   * Behavior: if no JWT token is available, the call will continue (backwards compatible).
   * If a token exists and requiredRoles is provided, the user's roles will be checked and
   * a 403-like error will be returned as an Observable if the check fails.
   */
  private ensureAuthorized(requiredRoles?: string[]): true | Observable<never> {
    const token = this.getToken();

    // If there's no token, do not block the request (preserve existing behavior).
    if (!token) return true;

    // If roles are not required, allow when token exists.
    if (!requiredRoles || requiredRoles.length === 0) return true;

    const userRoles = this.getUserRoles();
    const hasRequiredRole = userRoles.some(r => requiredRoles.includes(r));

    if (!hasRequiredRole) {
      // Return an observable that errors with a consistent Error instance.
      return throwError(() => new Error('Forbidden: insufficient role'));
    }

    return true;
  }

  private isObservableError(value: true | Observable<never>): value is Observable<never> {
    return value !== true;
  }

  private getToken(): string | null {
    try {
      // Prefer token from localStorage. This keeps the solution framework-agnostic.
      return localStorage.getItem('auth_token');
    } catch (e) {
      // localStorage may throw in some environments; fail gracefully.
      return null;
    }
  }

  private getUserRoles(): string[] {
    try {
      const raw = localStorage.getItem('user_roles');
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed.map(String) : [];
    } catch (e) {
      return [];
    }
  }

  private handleError(error: HttpErrorResponse | any): Observable<never> {
    // Preserve the original error shape where possible while providing a normalized Error.
    if (error instanceof HttpErrorResponse) {
      const message = `HTTP ${error.status}: ${error.message || 'Unknown error'}`;
      return throwError(() => new Error(message));
    }

    // If it's an Error-like object thrown by this service (e.g. Forbidden), forward it.
    if (error instanceof Error) return throwError(() => error);

    return throwError(() => new Error('An unknown error occurred'));
  }
}
