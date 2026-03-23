import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { catchError, tap } from 'rxjs/operators';

export interface AuthResponse {
  // token is optional because legacy server might return other shapes
  token?: string;
  // preserve other properties returned by the server
  [key: string]: any;
}

@Injectable({
  providedIn: 'root',
})
export class LoginService {
  private readonly apiUrl: string = `${environment.baseApiUrl}/api/Users`;
  private readonly tokenStorageKey = 'auth_token';

  constructor(private http: HttpClient) {}

  /**
   * Attempts login using the existing API contract (GET /api/Users/{username}/{password}).
   * If the response contains a JWT token it will be stored locally for subsequent requests.
   * Note: the HTTP verb and URL are preserved to avoid changing backend behaviour.
   */
  logIn(username: string, password: string): Observable<AuthResponse> {
    const headers = this.jsonHeaders();
    const safeUsername = encodeURIComponent(username ?? '');
    const safePassword = encodeURIComponent(password ?? '');

    // Preserve original API behaviour (GET with username/password in path)
    return this.http.get<AuthResponse>(`${this.apiUrl}/${safeUsername}/${safePassword}`, { headers }).pipe(
      tap((response: AuthResponse) => {
        if (response && typeof response.token === 'string' && response.token.length > 0) {
          this.saveToken(response.token);
        }
      }),
      catchError(this.handleError('logIn'))
    );
  }

  /** Build JSON content headers */
  private jsonHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json; charset=utf-8',
    });
  }

  /** Save token to localStorage (could be switched to a cookie with httpOnly flag on the server for more security) */
  private saveToken(token: string): void {
    try {
      localStorage.setItem(this.tokenStorageKey, token);
    } catch (e) {
      // If storage is unavailable, fail silently but keep functionality intact
      // (do not change behaviour of login call itself)
      // Consider reporting to analytics or further monitoring in a real app
      // eslint-disable-next-line no-console
      console.warn('Unable to persist auth token to localStorage.', e);
    }
  }

  /** Remove persisted token */
  logout(): void {
    try {
      localStorage.removeItem(this.tokenStorageKey);
    } catch (e) {
      // ignore
    }
  }

  /** Retrieve token if present */
  getToken(): string | null {
    try {
      return localStorage.getItem(this.tokenStorageKey);
    } catch (e) {
      return null;
    }
  }

  /** Convenience: build Authorization header when token is available */
  getAuthHeaders(): HttpHeaders {
    const token = this.getToken();
    if (token) {
      return new HttpHeaders({
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json; charset=utf-8',
      });
    }
    return this.jsonHeaders();
  }

  /** Returns true when a token exists (does not validate expiry). Token validation must be performed by backend or additional checks. */
  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  /** Extract roles from a JWT token payload if present. Supports common shapes: roles (array) or role/roles as string. */
  getUserRoles(): string[] {
    const token = this.getToken();
    if (!token) {
      return [];
    }

    try {
      const payload = this.decodeJwtPayload(token);
      if (!payload) return [];

      const rolesClaim = payload['roles'] ?? payload['role'] ?? payload['roles'] ?? null;
      if (!rolesClaim) return [];

      if (Array.isArray(rolesClaim)) return rolesClaim.map((r) => String(r));
      return [String(rolesClaim)];
    } catch (e) {
      return [];
    }
  }

  /** Check whether the user has a specific role */
  hasRole(expected: string): boolean {
    if (!expected) return false;
    const roles = this.getUserRoles();
    return roles.some((r) => r.toLowerCase() === expected.toLowerCase());
  }

  /** Decode JWT payload (base64url) without external libs. Returns parsed object or null. */
  private decodeJwtPayload(token: string): any | null {
    try {
      const parts = token.split('.');
      if (parts.length < 2) return null;
      const payload = parts[1];
      const json = this.base64UrlDecode(payload);
      return JSON.parse(json);
    } catch (e) {
      return null;
    }
  }

  /** Base64Url decode helper */
  private base64UrlDecode(input: string): string {
    // Replace URL-safe characters
    let base64 = input.replace(/-/g, '+').replace(/_/g, '/');
    // Pad with '='
    while (base64.length % 4) {
      base64 += '=';
    }
    // atob throws on invalid input
    return atob(base64);
  }

  /** Generic error handler wrapper */
  private handleError(operation = 'operation') {
    return (error: any) => {
      // Keep the original error shape to preserve behaviour for callers
      // but log here for easier troubleshooting
      // eslint-disable-next-line no-console
      console.error(`${operation} failed:`, error);
      return throwError(error);
    };
  }
}
