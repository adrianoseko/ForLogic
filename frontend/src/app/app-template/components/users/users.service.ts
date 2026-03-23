import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  // Base API url - unchanged behavior
  private readonly apiUrl: string = `${environment.baseApiUrl}/api/Users`;

  // Key used to persist JWT locally (if desired)
  private readonly tokenStorageKey = 'auth_token';
  private authToken: string | null = null;

  constructor(private http: HttpClient) {
    this.loadTokenFromStorage();
  }

  /**
   * Public API: get list of users. Preserves original behavior but will include Authorization header
   * when a token has been set via setToken().
   */
  getUsers(): Observable<User[]> {
    const headers = this.createHeaders();
    return this.http.get<User[]>(this.apiUrl, { headers }).pipe(catchError(this.handleError));
  }

  /**
   * Set the JWT used for authenticated requests. Optionally persist to localStorage.
   */
  setToken(token: string, persist: boolean = true): void {
    this.authToken = token || null;
    if (persist && token) {
      try {
        localStorage.setItem(this.tokenStorageKey, token);
      } catch {
        // ignore storage failures (e.g. private mode) to preserve original behavior
      }
    }
  }

  /**
   * Clear stored token from memory and storage.
   */
  clearToken(): void {
    this.authToken = null;
    try {
      localStorage.removeItem(this.tokenStorageKey);
    } catch {
      // ignore storage failures
    }
  }

  /**
   * Returns the current authenticated user (if the JWT contains user claims) or null.
   * This is a lightweight client-side helper and does not replace server-side authorization.
   */
  getCurrentUser(): User | null {
    const payload = this.getJwtPayload();
    if (!payload) {
      return null;
    }

    return {
      id: payload.sub ? Number(payload.sub) : 0,
      name: payload.name || payload.unique_name || '',
      email: payload.email || '',
    };
  }

  /**
   * Role check helper. Returns true if token contains the requested role claim.
   */
  hasRole(role: string): boolean {
    const payload = this.getJwtPayload();
    if (!payload) {
      return false;
    }

    const rolesClaim = payload.roles || payload.role || payload.Roles || payload.role_name;

    if (!rolesClaim) {
      return false;
    }

    if (Array.isArray(rolesClaim)) {
      return rolesClaim.includes(role);
    }

    // roles might be a space/comma-separated string
    const rolesAsString = String(rolesClaim);
    return rolesAsString.split(/[ ,;]+/).includes(role);
  }

  /**
   * Helper to decide whether an origin is allowed. In development we can allow all;
   * in production check a configured allowed origins list. This references environment
   * properties and does not change existing API behavior.
   */
  isOriginAllowed(origin: string): boolean {
    if (!environment.production) {
      // allow during development for convenience (do not change production settings here)
      return true;
    }

    const allowedOrigins: string[] = (environment as any).allowedOrigins || [];
    return allowedOrigins.includes(origin);
  }

  // -------------------------
  // Internal helpers
  // -------------------------
  private createHeaders(): HttpHeaders {
    let headers = new HttpHeaders({ 'Content-Type': 'application/json; charset=utf-8' });
    if (this.authToken) {
      headers = headers.set('Authorization', `Bearer ${this.authToken}`);
    }
    return headers;
  }

  private loadTokenFromStorage(): void {
    try {
      const token = localStorage.getItem(this.tokenStorageKey);
      this.authToken = token || null;
    } catch {
      this.authToken = null;
    }
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    // Preserve original behavior: surface the error to callers.
    return throwError(error);
  }

  /**
   * Decode JWT payload safely without external libs. Returns the payload object or null.
   */
  private getJwtPayload(): any | null {
    if (!this.authToken) {
      return null;
    }

    const parts = this.authToken.split('.');
    if (parts.length < 2) {
      return null;
    }

    const payloadBase64 = parts[1];
    try {
      const json = atob(this.padBase64(payloadBase64));
      return JSON.parse(json);
    } catch {
      return null;
    }
  }

  /**
   * Ensures base64 string has proper padding before decoding with atob.
   */
  private padBase64(base64: string): string {
    const pad = base64.length % 4;
    if (pad === 2) {
      return `${base64}==`;
    }
    if (pad === 3) {
      return `${base64}=`;
    }
    if (pad === 1) {
      // invalid base64
      return base64;
    }
    return base64;
  }
}

export interface User {
  id: number;
  name: string;
  email: string;
  // Add other user properties as needed
}
