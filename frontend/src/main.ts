import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

// Small, self-contained auth helper to initialize client-side authentication state.
// This file intentionally keeps logic local to avoid changing app module structure.
// The initializer is non-blocking for bootstrap errors (it will not prevent the app
// from starting if auth initialization fails) to preserve original behavior.

interface JwtPayload {
  exp?: number;
  iat?: number;
  sub?: string;
  roles?: string[];
  [key: string]: any;
}

interface AuthState {
  isAuthenticated: boolean;
  token?: string | null;
  roles: string[];
  userId?: string | null;
}

class AuthManager {
  private static STORAGE_KEY = 'auth_token';

  // Initialize auth state and expose it on window.__APP_AUTH__ for the app to consume.
  public static async initialize(): Promise<void> {
    try {
      const token = this.getTokenFromStorageOrCookie();
      const state: AuthState = { isAuthenticated: false, token: null, roles: [], userId: null };

      if (token && this.isTokenStructureValid(token)) {
        const payload = this.decodeJwt(token);
        const expired = this.isTokenExpired(payload);

        if (!expired) {
          state.isAuthenticated = true;
          state.token = token;
          state.roles = Array.isArray(payload.roles) ? payload.roles : [];
          state.userId = payload.sub ?? null;
        }
      }

      // Expose a read-only app-level auth snapshot. Consumers should implement proper services.
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      window.__APP_AUTH__ = Object.freeze(state);
    } catch (err) {
      // Do not block the app; just log
      console.error('Auth initialization failed:', err);
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      window.__APP_AUTH__ = Object.freeze({ isAuthenticated: false, token: null, roles: [], userId: null });
    }
  }

  private static getTokenFromStorageOrCookie(): string | null {
    try {
      // Prefer secure storage if provided; fallback to cookie.
      const fromStorage = localStorage.getItem(this.STORAGE_KEY);
      if (fromStorage) return fromStorage;

      // Try cookie (simple parse). In a real app, use a robust cookie library and secure attributes.
      const cookies = document.cookie ? document.cookie.split(';') : [];
      for (const c of cookies) {
        const [rawName, rawVal] = c.split('=');
        if (!rawName) continue;
        const name = rawName.trim();
        if (name === this.STORAGE_KEY) {
          return decodeURIComponent((rawVal || '').trim());
        }
      }

      return null;
    } catch (err) {
      console.warn('Failed to read auth token from storage/cookie:', err);
      return null;
    }
  }

  private static isTokenStructureValid(token: string): boolean {
    return typeof token === 'string' && token.split('.').length === 3;
  }

  private static decodeJwt(token: string): JwtPayload {
    try {
      const parts = token.split('.');
      const payload = parts[1];
      // base64url -> base64
      const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
      const json = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(json) as JwtPayload;
    } catch (err) {
      console.warn('Failed to decode JWT payload:', err);
      return {};
    }
  }

  private static isTokenExpired(payload: JwtPayload): boolean {
    try {
      if (!payload || typeof payload !== 'object') return true;
      if (!payload.exp) return false; // no exp claim -> treat as non-expiring for compatibility
      const now = Math.floor(Date.now() / 1000);
      return payload.exp <= now;
    } catch (err) {
      console.warn('Error while checking token expiry:', err);
      return true;
    }
  }
}

// Validate important environment settings and provide warnings to avoid insecure defaults.
function validateEnvironmentConfig(): void {
  try {
    if (environment.production) {
      // If allowed origins are present and include a wildcard in production, warn developers.
      // This guard is informational only and will not change runtime behavior in order to preserve
      // existing behavior.
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const allowedOrigins = environment?.corsAllowedOrigins;
      if (allowedOrigins && (Array.isArray(allowedOrigins) ? allowedOrigins.includes('*') : allowedOrigins === '*')) {
        console.warn(
          'Production environment is configured with wildcard CORS allowed origin. ' +
            'Please restrict CORS to known origins in production settings.'
        );
      }
    }
  } catch (err) {
    console.warn('Failed to validate environment configuration:', err);
  }
}

const handleBootstrapError = (error: unknown): void => {
  // Centralized error handling for bootstrap processes. This preserves the previous
  // console.error behavior but adds structured context for easier debugging.
  try {
    console.error('Bootstrap error:', error);
    // Potential place to forward errors to a remote logging endpoint if configured.
    // Keep this non-blocking and optional to preserve original behavior.
  } catch (err) {
    // If logging itself fails, ensure no exception escapes.
    // eslint-disable-next-line no-console
    console.error('Error while handling bootstrap error:', err);
  }
};

const bootstrapApplication = async (): Promise<void> => {
  try {
    if (environment.production) {
      enableProdMode();
    }

    // Validate configuration and initialize lightweight client auth snapshot. Both are
    // intentionally non-blocking for the app bootstrap (they shouldn't prevent the app
    // from starting even if they fail).
    validateEnvironmentConfig();
    await AuthManager.initialize();

    await platformBrowserDynamic().bootstrapModule(AppModule);
  } catch (error) {
    handleBootstrapError(error);
  }
};

bootstrapApplication();
