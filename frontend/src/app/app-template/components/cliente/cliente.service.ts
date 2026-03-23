import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

/**
 * Lightweight client representation. Keep flexible to preserve compatibility with existing API fields.
 */
export interface Client {
  [key: string]: any;
}

@Injectable({
  providedIn: 'root',
})
export class ClientService {
  private readonly apiUrl: string = `${environment.baseApiUrl}/api/Client`;
  // Toggle enforcement of role checks. If set in environment (enforceRoleChecks) or in production,
  // role checks will throw when the required role is not present in the token. Default is false to preserve
  // backwards-compatible behavior unless explicitly enabled.
  private readonly enforceRoleChecks: boolean = Boolean((environment as any).enforceRoleChecks) || Boolean((environment as any).production);

  constructor(private http: HttpClient) {}

  /**
   * Retrieve list of clients.
   * Optional requiredRoles param can be used to assert caller role(s). By default role checks are not enforced
   * unless configure via environment.enforceRoleChecks or when running in production (see above).
   */
  getClients(requiredRoles?: string | string[]): Observable<any> {
    if (requiredRoles) {
      this.ensureHasRole(requiredRoles);
    }

    return this.http
      .get<any>(this.apiUrl, this.getHttpOptions())
      .pipe(catchError((err) => this.handleError(err)));
  }

  /**
   * Create a new client.
   * Accepts flexible Client objects to preserve existing behavior.
   */
  postClient(clientData: Client, requiredRoles?: string | string[]): Observable<any> {
    if (requiredRoles) {
      this.ensureHasRole(requiredRoles);
    }

    return this.http
      .post<any>(this.apiUrl, clientData, this.getHttpOptions())
      .pipe(catchError((err) => this.handleError(err)));
  }

  /**
   * Create http options and include an Authorization header when a valid JWT is available.
   * The token is looked up in sessionStorage then localStorage under the key 'auth_token'.
   * Using Authorization header is non-breaking: when no token is present the header is omitted.
   */
  private getHttpOptions(): { headers: HttpHeaders } {
    const headersConfig: { [name: string]: string } = {
      'Content-Type': 'application/json; charset=utf-8',
      'X-Requested-With': 'XMLHttpRequest',
    };

    const token = this.getAuthToken();
    if (token && this.isJwt(token) && !this.isTokenExpired(token)) {
      headersConfig['Authorization'] = `Bearer ${token}`;
    }

    const headers = new HttpHeaders(headersConfig);
    return { headers };
  }

  /**
   * Try to retrieve JWT from secure client storage locations. Prefer sessionStorage, then localStorage.
   * Note: HttpOnly cookies cannot be read from JS; if your app stores tokens there, this method will not
   * surface them (which is good for security). In that case, server-side cookie handling or an interceptor
   * that relies on cookie auth is preferred.
   */
  private getAuthToken(): string | null {
    try {
      const sessionToken = sessionStorage.getItem('auth_token');
      if (sessionToken) {
        return sessionToken;
      }
      const localToken = localStorage.getItem('auth_token');
      return localToken || null;
    } catch (e) {
      // Defensive: accessing storage can throw in some browser privacy modes.
      return null;
    }
  }

  private isJwt(token: string): boolean {
    return typeof token === 'string' && token.split('.').length === 3;
  }

  private decodeJwtPayload(token: string): any | null {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;
      const payload = parts[1];
      // base64url -> base64
      const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
      // Pad with '=' until length is multiple of 4
      const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=');
      const decoded = atob(padded);
      return JSON.parse(decoded);
    } catch (e) {
      return null;
    }
  }

  private isTokenExpired(token: string): boolean {
    const payload = this.decodeJwtPayload(token);
    if (!payload || typeof payload !== 'object') return true;
    // exp is in seconds since epoch
    const exp = payload.exp;
    if (!exp) return false; // no exp claim treated as non-expiring for compatibility
    const now = Math.floor(Date.now() / 1000);
    return now >= Number(exp);
  }

  private getRolesFromToken(token: string): string[] {
    const payload = this.decodeJwtPayload(token) || {};
    const rolesClaim = payload.roles || payload.role || payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || payload['roles'];
    if (!rolesClaim) return [];
    if (Array.isArray(rolesClaim)) return rolesClaim.map(String);
    // Roles can be a space/comma separated string
    if (typeof rolesClaim === 'string') {
      return rolesClaim.split(/[ ,]+/).filter(Boolean);
    }
    return [];
  }

  /**
   * Check if the current token has at least one of the required roles.
   */
  hasRole(requiredRoles: string | string[]): boolean {
    const token = this.getAuthToken();
    if (!token || !this.isJwt(token) || this.isTokenExpired(token)) return false;
    const roles = this.getRolesFromToken(token);
    const required = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
    return required.some((r) => roles.includes(r));
  }

  /**
   * Enforce role presence when enforcement is enabled. Will throw an Error when the role is missing.
   * When enforcement is disabled this is a no-op to preserve existing behavior.
   */
  private ensureHasRole(requiredRoles: string | string[]): void {
    if (!this.enforceRoleChecks) return; // don't change behavior unless explicitly configured
    const ok = this.hasRole(requiredRoles);
    if (!ok) {
      // Throwing here will cause the Observable creation to error before issuing network calls.
      // This models role-based authorization on the client side. Server-side authorization should
      // still be in place to guarantee security.
      throw new Error('Unauthorized: missing required role(s)');
    }
  }

  private handleError(error: HttpErrorResponse) {
    // Preserve original Error object information but normalize into a friendly shape.
    const message = error?.error?.message || error.message || 'An unknown error occurred';
    const errorInfo = {
      status: error.status,
      message,
      error: error.error || null,
    };
    return throwError(() => errorInfo);
  }
}
