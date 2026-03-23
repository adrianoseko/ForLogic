// This file is required by karma.conf.js and loads recursively all the .spec and framework files

import 'zone.js/dist/zone-testing';
import { getTestBed } from '@angular/core/testing';
import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing';

declare const require: {
  context(path: string, deep?: boolean, filter?: RegExp): {
    keys(): string[];
    <T>(id: string): T;
  };
};

/**
 * Initializes the Angular testing environment.
 */
export function initializeTestingEnvironment(): void {
  getTestBed().initTestEnvironment(
    BrowserDynamicTestingModule,
    platformBrowserDynamicTesting()
  );
}

/**
 * Obtains the test context that loads all .spec.ts files under this directory.
 */
export function getTestContext() {
  return require.context('./', true, /\.spec\.ts$/);
}

/**
 * Loads all test modules from the provided context.
 * If no context is provided, it uses the default test context.
 */
export function loadTestModules(context = getTestContext()): void {
  context.keys().forEach(context);
}

/*
  Security and deployment guidance (developer notes):

  - Authentication & Authorization:
    Add JWT or secure cookie-based authentication on the backend.
    Protect controller endpoints with role-based policies/claims.
    Examples (not executable here):

    Node/Express (JWT middleware - conceptual):
      import jwt from 'express-jwt';
      app.use(jwt({ secret: process.env.JWT_SECRET, algorithms: ['HS256'] }));
      // Protect routes:
      app.get('/api/admin', checkRole('admin'), adminController);

    ASP.NET Core (policy-based):
      services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
              .AddJwtBearer(options => { /* configure */ });
      services.AddAuthorization(options =>
      {
          options.AddPolicy('AdminOnly', policy => policy.RequireRole('Admin'));
      });
      [Authorize(Policy = 'AdminOnly')] on controller/actions.

  - CORS:
    Do not use AllowAll in production. Restrict origins per environment.
    Keep dev/prod configuration separate and protected (environment variables or secure config store).
    Example (Express):
      const allowed = process.env.NODE_ENV === 'production'
        ? ['https://myapp.example.com']
        : ['http://localhost:4200'];
      app.use(cors({ origin: allowed, credentials: true }));

  The code below exposes small helpers to centralize these settings for the dev team.
  They are intentionally not executed in this test bootstrap file to preserve test behavior.
*/

export function getAllowedCorsOrigins(env = (typeof process !== 'undefined' && process.env && process.env.NODE_ENV) ? process.env.NODE_ENV : 'development'): string[] {
  return env === 'production'
    ? ['https://your-production-domain.example'] // replace with real production origins
    : ['http://localhost:4200', 'http://localhost:3000'];
}

export function recommendedAuthConfig(): Record<string, string> {
  // This is a guidance-only helper; secrets must never be checked into source control.
  return {
    strategy: 'JWT',
    tokenLocation: 'Authorization: Bearer <token>',
    roleClaim: 'roles'
  };
}

// Initialize the Angular testing environment and load the test modules.
initializeTestingEnvironment();
loadTestModules();
