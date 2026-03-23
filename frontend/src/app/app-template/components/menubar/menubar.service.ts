import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class MenubarService {
  private readonly apiUrl: string;

  constructor(private readonly http: HttpClient) {
    // Prefer environment configuration in build-time; fall back to localStorage to preserve existing behavior
    const envHost = environment?.apiHost;
    if (envHost) {
      this.apiUrl = `${envHost}:8000/departments/`;
    } else {
      const hostFromStorage = localStorage.getItem('host');
      this.apiUrl = `${hostFromStorage}:8000/departments/`;
    }
  }

  /**
   * Fetch departments from the backend. Preserves original behavior of sending the same
   * authorization header format ("token <token>").
   */
  public getDepartments(): Observable<Department[]> {
    const headers = this.createAuthorizationHeader();
    return this.http.get<Department[]>(this.apiUrl, { headers }).pipe(
      // surface HTTP errors through the Observable chain while also allowing centralized handling
      catchError((err) => {
        // Keep behavior consistent while adding safer error propagation
        console.error('Failed to fetch departments:', err);
        return throwError(err);
      })
    );
  }

  /**
   * Creates the Authorization header. Throws an Error if token is missing to preserve original behavior.
   * Uses the same header format as the original implementation: "token <token>".
   */
  private createAuthorizationHeader(): HttpHeaders {
    const token = localStorage.getItem('token');
    if (!token) {
      // Preserve original synchronous error throwing behavior
      throw new Error('Authorization token is missing');
    }

    return new HttpHeaders().set('Authorization', `token ${token}`);
  }

  /**
   * Convenience helper to check if the currently stored JWT token (if JWT) contains a given role.
   * This does not alter request headers; it only inspects token payload. It is defensive and returns false
   * if token is missing or malformed.
   */
  public hasRole(expectedRole: string): boolean {
    const token = localStorage.getItem('token');
    if (!token) {
      return false;
    }

    const payload = this.decodeJwtPayload(token);
    if (!payload) {
      return false;
    }

    const roles = Array.isArray(payload.roles) ? payload.roles : typeof payload.role === 'string' ? [payload.role] : [];
    return roles.includes(expectedRole);
  }

  /**
   * Decodes a JWT payload (base64url) without validating signature. Returns null on failure.
   */
  private decodeJwtPayload(token: string): any | null {
    try {
      const parts = token.split('.');
      if (parts.length < 2) {
        return null;
      }
      const payloadBase64 = parts[1]
        .replace(/-/g, '+')
        .replace(/_/g, '/');
      // Pad base64 string
      const pad = payloadBase64.length % 4;
      const padded = payloadBase64 + (pad ? '='.repeat(4 - pad) : '');
      const decoded = atob(padded);
      return JSON.parse(decoded);
    } catch (e) {
      console.warn('Failed to decode JWT payload', e);
      return null;
    }
  }

  /**
   * Allows runtime override for API host (useful for dev/test without rebuilding). Does not persist anything.
   */
  public setApiHost(host: string): void {
    this.apiUrl = `${host}:8000/departments/`;
  }
}

export interface Department {
  id: number;
  name: string;
  // Add other relevant fields here
}
