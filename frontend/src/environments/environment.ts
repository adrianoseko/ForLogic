// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

// NOTE:
// This file contains client-side configuration only. Do NOT place secrets (private keys,
// client secrets, or any sensitive credentials) in source-controlled environment files.
// Keep production secrets in a secure store and inject them at build/host time.

// The Environment interface describes the shape of this configuration object.
// Add new properties here when you need to expose non-secret configuration values
// to the frontend. Keep values minimal and avoid business logic here.
interface Environment {
  production: boolean;
  baseApiUrl: string;

  // Authentication configuration (public, non-secret):
  // - tokenStorageKey: key used to store JWT in localStorage/sessionStorage or cookies client-side
  // - loginEndpoint / refreshEndpoint: relative endpoints appended to baseApiUrl
  // - tokenExpiryBufferSeconds: safety buffer before token expiry to trigger refresh
  // - roles: canonical role names used by the frontend for RBAC checks
  auth: {
    tokenStorageKey: string;
    loginEndpoint: string;
    refreshEndpoint: string;
    tokenExpiryBufferSeconds: number;
    roles: {
      admin: string;
      user: string;
      guest: string;
    };
  };

  // CORS and client-side allowed origin hints (used by dev tooling / runtime checks)
  // In production, the backend must enforce CORS and this should be restricted to
  // explicit origins. Do NOT use an "AllowAll" policy in production.
  cors: {
    allowedOrigins: string[];
    allowCredentials: boolean;
  };

  // Client-side security toggles (non-secret). Backend must be authoritative
  // for things like CSRF protection and auth enforcement.
  security: {
    enableCsrfProtection: boolean;
  };
}

export const environment: Readonly<Environment> = Object.freeze({
  // Preserve original behavior: development environment
  production: false,

  // Preserve original base API URL for dev:
  baseApiUrl: 'http://localhost:8000/',

  // Authentication-related client configuration. This does NOT implement
  // authentication itself but provides stable keys and endpoints for the app.
  // For production, replace endpoints/keys in environment.prod.ts and ensure
  // tokens are handled securely (HttpOnly cookies or secure storage and
  // proper CSRF protection).
  auth: {
    tokenStorageKey: 'app_auth_token',
    loginEndpoint: 'auth/login',
    refreshEndpoint: 'auth/refresh',
    tokenExpiryBufferSeconds: 60, // attempt refresh 60s before expiry
    roles: {
      admin: 'Admin',
      user: 'User',
      guest: 'Guest'
    }
  },

  // CORS hints for dev. In dev we allow the local Angular dev server origin.
  // In production, configure environment.prod.ts to include only your real
  // frontend origins (no wildcard AllowAll).
  cors: {
    allowedOrigins: ['http://localhost:4200'],
    allowCredentials: true
  },

  // Toggle client-side CSRF handling guidance. Always ensure server-side
  // CSRF protections are enabled in production for cookie-based auth.
  security: {
    enableCsrfProtection: true
  }
});

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
