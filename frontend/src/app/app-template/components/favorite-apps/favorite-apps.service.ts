import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';

export interface FavoriteApp {
  id: string | number;
  [key: string]: any;
}

@Injectable({
  providedIn: 'root',
})
export class FavoriteAppsService {
  private readonly apiUrl: string;
  private readonly authScheme: string;

  constructor(private http: HttpClient) {
    // Prefer environment configuration for host in order to cleanly separate dev/prod settings
    // and to avoid AllowAll CORS or insecure defaults in production.
    // Fall back to legacy localStorage.host for backwards compatibility if env not set.
    const hostFallback = `${(localStorage as any).host}:8000`;
    const host = environment?.apiHost ?? hostFallback;

    // Ensure the base URL ends with a single slash and append endpoint
    this.apiUrl = `${host.replace(/\/+$/, '')}/app-index-favorites/`;

    // Allow configuring the authentication scheme (e.g. 'Bearer' or 'token') via environment.
    // Default to 'token' to preserve existing behavior.
    this.authScheme = environment?.authScheme ?? 'token';
  }

  /**
   * Get favorite apps from the API.
   * Preserves original Observable<any> return type for compatibility.
   */
  public getApps(): Observable<any> {
    const headers = this.createAuthorizationHeader();
    return this.http.get(this.apiUrl, { headers });
  }

  /**
   * Increment/add a hit for an app (PUT against the resource id).
   */
  public addHit(app: FavoriteApp): Observable<any> {
    if (!app || (app as any).id === undefined || (app as any).id === null) {
      throw new Error('Invalid app parameter: missing id');
    }

    const headers = this.createAuthorizationHeader();
    const url = `${this.apiUrl}${encodeURIComponent(String(app.id))}/`;
    return this.http.put<any>(url, app, { headers });
  }

  /**
   * Helper to check whether the stored token contains a given role.
   * This is a client-side convenience and does not replace server-side authorization.
   */
  public hasRole(expectedRole: string): boolean {
    try {
      const token = this.getToken();
      if (!token) {
        return false;
      }
      const payload = this.decodeJwtPayload(token);
      if (!payload) {
        return false;
      }

      // Support common claim names: role, roles, roles[], and 'authorities'
      if (typeof payload.role === 'string' && payload.role === expectedRole) {
        return true;
      }
      if (Array.isArray(payload.roles) && payload.roles.includes(expectedRole)) {
        return true;
      }
      if (Array.isArray(payload.authorities) && payload.authorities.includes(expectedRole)) {
        return true;
      }

      return false;
    } catch (err) {
      // On any parsing error, assume role not present
      return false;
    }
  }

  /**
   * Create HttpHeaders with Authorization header.
   * Throws if token is missing to preserve original behavior.
   */
  private createAuthorizationHeader(): HttpHeaders {
    const token = this.getToken();
    if (!token) {
      // Preserve original error message to keep behavior identical for callers
      throw new Error('Authorization token is missing');
    }

    // Keep scheme configurable but default to the original 'token' scheme
    const headerValue = `${this.authScheme} ${token}`.trim();
    return new HttpHeaders().set('Authorization', headerValue);
  }

  /**
   * Retrieve token from a secure place. Prefer cookie (if used) then fall back to localStorage.
   * This method centralizes token retrieval so storage mechanism can be changed in one place.
   */
  private getToken(): string | null {
    // Try cookie first (useful if the app switched to httpOnly cookies via server-side auth)
    const cookieToken = this.getCookie('auth_token');
    if (cookieToken) {
      return cookieToken;
    }

    // Fallback to legacy localStorage token for backward compatibility
    const token = (localStorage as any).token;
    return token ?? null;
  }

  /**
   * Decode a JWT payload without validating signature (client-side only).
   */
  private decodeJwtPayload(token: string): any | null {
    try {
      const parts = token.split('.');
      if (parts.length < 2) {
        return null;
      }
      const payload = parts[1];
      // Add padding if necessary
      const padded = payload.replace(/-/g, '+').replace(/_/g, '/');
      const padLen = (4 - (padded.length % 4)) % 4;
      const base64 = padded + '='.repeat(padLen);
      const json = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(json);
    } catch (e) {
      return null;
    }
  }

  /**
   * Read a cookie value by name.
   */
  private getCookie(name: string): string | null {
    if (typeof document === 'undefined' || !document.cookie) {
      return null;
    }
    const matches = document.cookie.match(new RegExp('(?:^|; )' + name.replace(/([.$?*|{}()\[\]\\\/\+^])/g, '\\$1') + '=([^;]*)'));
    return matches ? decodeURIComponent(matches[1]) : null;
  }
}
