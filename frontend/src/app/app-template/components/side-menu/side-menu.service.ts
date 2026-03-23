import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

export interface MenuItem {
  id: string;
  label: string;
  route?: string;
  icon?: string;
  [key: string]: any;
}

@Injectable({
  providedIn: 'root',
})
export class SideMenuService {
  // Prefer environment configuration; fall back to placeholder for development.
  private readonly apiUrl: string = (environment && (environment as any).apiUrl) || 'your-api-url';

  constructor(private http: HttpClient) {}

  /**
   * Retrieve side menu items from the API.
   * If requiredRoles is provided, the method will enforce a client-side role check before calling the endpoint.
   * (Server-side authorization must still be enforced by the backend.)
   */
  public getMenuItems(requiredRoles?: string[]): Observable<MenuItem[]> {
    if (requiredRoles && !this.hasRequiredRoles(requiredRoles)) {
      // Return a 403-style error observable when the client lacks the required role(s).
      return throwError(() => new HttpErrorResponse({ status: 403, statusText: 'Forbidden' }));
    }

    return this.http
      .get<MenuItem[]>(`${this.apiUrl}/menu-items`, { headers: this.createHeaders() })
      .pipe(catchError((err) => this.handleError(err)));
  }

  /** Build headers including content type, accept and an Authorization header when a JWT is available. */
  private createHeaders(): HttpHeaders {
    const headersConfig: { [header: string]: string } = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };

    const token = this.getToken();
    if (token) {
      headersConfig['Authorization'] = `Bearer ${token}`;
    }

    return new HttpHeaders(headersConfig);
  }

  /** Try to obtain the token from a secure cookie first, then localStorage as fallback. */
  private getToken(): string | null {
    const cookieToken = this.getCookie('auth_token');
    if (cookieToken) {
      return cookieToken;
    }
    return localStorage.getItem('auth_token');
  }

  private getCookie(name: string): string | null {
    if (typeof document === 'undefined' || !document.cookie) {
      return null;
    }
    const match = document.cookie
      .split(';')
      .map((c) => c.trim())
      .find((c) => c.startsWith(`${name}=`));
    if (!match) {
      return null;
    }
    const value = match.split('=')[1] || '';
    try {
      return decodeURIComponent(value);
    } catch {
      return value || null;
    }
  }

  /** Decode JWT payload safely to read roles. Returns null on failure. */
  private decodeJwt(token: string): any | null {
    try {
      const parts = token.split('.');
      if (parts.length < 2) {
        return null;
      }
      const payload = parts[1].replace(/-/g, '+').replace(/_/g, '/');
      // atob expects properly padded base64. This may throw if padding is incorrect.
      const decoded = atob(payload);
      // decodeURIComponent(escape(...)) helps handle UTF-8 characters in some browsers.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return JSON.parse(decodeURIComponent(escape(decoded)) as any);
    } catch {
      return null;
    }
  }

  /**
   * Basic role check against the JWT payload. This is client-side only and helps avoid unnecessary calls.
   * Server-side authorization must be applied on the backend controller endpoints.
   */
  private hasRequiredRoles(requiredRoles: string[]): boolean {
    const token = this.getToken();
    if (!token) {
      return false;
    }
    const payload = this.decodeJwt(token);
    if (!payload) {
      return false;
    }
    const roles: string[] = Array.isArray(payload.roles)
      ? payload.roles
      : payload.role
      ? [payload.role]
      : [];
    return requiredRoles.every((r) => roles.includes(r));
  }

  /** Centralized error handling for HTTP requests originating from this service. */
  private handleError(error: HttpErrorResponse): Observable<never> {
    // TODO: Integrate with a centralized logging/notification service if available.
    console.error('SideMenuService error:', error);
    return throwError(() => error);
  }
}
