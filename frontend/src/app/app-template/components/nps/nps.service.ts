import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';

export interface NpsEvaluation {
  [key: string]: any;
}

@Injectable({
  providedIn: 'root'
})
export class NpsService {
  private readonly apiUrl: string;

  constructor(private http: HttpClient) {
    // Keep original API route intact
    this.apiUrl = `${environment.baseApiUrl}/api/Avaliacao`;
  }

  /**
   * Fetch NPS/Evaluation data from the API.
   * If `requiredRoles` is provided the request will be rejected client-side when roles are missing.
   * This keeps original behavior when `requiredRoles` is omitted.
   */
  public getAvaliacao(requiredRoles?: string[]): Observable<any> {
    if (requiredRoles && !this.isAuthorized(requiredRoles)) {
      return throwError(() => new Error('User does not have required roles'));
    }

    const headers = this.createHeaders();
    return this.http.get<any>(this.apiUrl, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Build HTTP headers. If a JWT is present it will add an Authorization header
   * and an X-CSRF-Token header when a CSRF cookie is present.
   * This is additive and will not change behavior when tokens/cookies are absent.
   */
  private createHeaders(): HttpHeaders {
    const headersConfig: { [key: string]: string } = {
      'Content-Type': 'application/json; charset=utf-8',
      'Accept': 'application/json'
    };

    const token = this.getAuthToken();
    if (token) {
      headersConfig['Authorization'] = `Bearer ${token}`;
      const csrf = this.getCookie('XSRF-TOKEN') || this.getCookie('CSRF-TOKEN');
      if (csrf) {
        headersConfig['X-CSRF-Token'] = csrf;
      }
    }

    return new HttpHeaders(headersConfig);
  }

  /**
   * Try to read an authentication token from localStorage or cookies.
   * Returns null if no token can be retrieved.
   */
  private getAuthToken(): string | null {
    try {
      // Support both localStorage and a cookie fallback
      return localStorage.getItem('auth_token') || this.getCookie('auth_token') || null;
    } catch {
      // Access to localStorage may throw in some environments; fail gracefully
      return null;
    }
  }

  /**
   * Check whether the JWT (if present) contains all required roles.
   * This is a client-side convenience check and must not replace server-side enforcement.
   */
  private isAuthorized(requiredRoles: string[]): boolean {
    const token = this.getAuthToken();
    if (!token) return false;

    try {
      const payload = this.parseJwt(token);
      const rolesClaim = payload['roles'] || payload['role'] || payload['roles_claim'] || [];
      const roles: string[] = Array.isArray(rolesClaim)
        ? rolesClaim
        : String(rolesClaim).split(',').map(r => r.trim()).filter(Boolean);

      return requiredRoles.every(r => roles.includes(r));
    } catch {
      return false;
    }
  }

  /**
   * Minimal JWT payload parser. Throws on invalid token.
   */
  private parseJwt(token: string): any {
    const parts = token.split('.');
    if (parts.length < 2) {
      throw new Error('Invalid JWT token');
    }

    const payload = parts[1];
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized + '='.repeat((4 - (normalized.length % 4)) % 4);
    const decoded = atob(padded);

    // Decode percent-encoded UTF-8 bytes to string and parse JSON
    const json = decodeURIComponent(Array.prototype.map.call(decoded, (c: string) =>
      '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
    return JSON.parse(json);
  }

  /**
   * Read a cookie value by name. Returns null if not found.
   */
  private getCookie(name: string): string | null {
    if (typeof document === 'undefined' || !document.cookie) return null;
    const escapedName = name.replace(/([.$?*|{}()[]\\\/+^])/g, '\\$1');
    const matches = document.cookie.match(new RegExp('(?:^|; )' + escapedName + '=([^;]*)'));
    return matches ? decodeURIComponent(matches[1]) : null;
  }

  /**
   * Centralized error handling to return a friendly Error via RxJS throwError.
   */
  private handleError(error: HttpErrorResponse) {
    let message = 'An unknown error occurred';

    if (error.error instanceof ErrorEvent) {
      message = `Client-side error: ${error.error.message}`;
    } else if (error && error.message) {
      message = `Server-side error: ${error.status} ${error.message}`;
    } else if (error && error.status) {
      message = `Server-side error: ${error.status}`;
    }

    return throwError(() => new Error(message));
  }
}
