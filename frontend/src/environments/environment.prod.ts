export interface AuthCookieOptions {
  secure: boolean; // ensure cookie is sent only over HTTPS
  sameSite: 'Strict' | 'Lax' | 'None';
  httpOnly: boolean; // prevent JS access to cookie
  path?: string;
  maxAgeSeconds?: number;
}

export interface AuthConfig {
  // Preferred strategy for storing auth tokens in the frontend
  // - 'jwt' uses Authorization header with Bearer token
  // - 'cookie' stores token in a cookie (recommended with httpOnly, secure)
  strategy: 'jwt' | 'cookie';

  // If strategy is 'cookie', this is the cookie name used by the backend
  tokenCookieName?: string;

  // If strategy is 'jwt', this header name will be used to send token
  tokenHeaderName?: string;

  // Optional endpoint on the API to refresh tokens
  tokenRefreshEndpoint?: string;

  // Recommended cookie options when using cookie strategy
  cookieOptions?: AuthCookieOptions;
}

export interface CorsConfig {
  // Explicit list of allowed origins for production deployments
  // In development you may use a different file (environment.ts) with local origins
  allowedOrigins: string[];
  // Whether to allow credentials (cookies, authorization headers) in cross-origin calls
  allowCredentials: boolean;
}

export interface Environment {
  production: boolean;
  baseApiUrl: string;

  // Optional, non-breaking additions to support authentication & CORS configuration
  auth?: AuthConfig;
  cors?: CorsConfig;

  // Map of API route prefixes to allowed roles for client-side policy enforcement (informational)
  authorizationPolicies?: { [routePrefix: string]: string[] };
}

export const environment: Environment = {
  // Keep production flag and baseApiUrl unchanged to preserve existing behavior
  production: true,
  baseApiUrl: 'http://10.0.0.9:8000/',

  // Frontend configuration to guide authentication implementation and cookie/security defaults
  // This does not change runtime behavior unless other parts of the app consume these fields.
  auth: {
    strategy: 'cookie',
    tokenCookieName: 'auth_token',
    tokenHeaderName: 'Authorization',
    tokenRefreshEndpoint: '/auth/refresh',
    cookieOptions: {
      secure: true,
      sameSite: 'Strict',
      httpOnly: true,
      path: '/',
      maxAgeSeconds: 60 * 60 * 24 // 1 day
    }
  },

  // Restrictive CORS configuration for production deployments
  // Developers should provide a different allowedOrigins list in environment.ts (dev) and keep secrets out of source control.
  cors: {
    // Only allow the known frontend origin(s) in production — do NOT use AllowAll here.
    allowedOrigins: ['http://10.0.0.9:4200'],
    allowCredentials: true
  },

  // Client-side informational role -> route mapping to support UI role checks
  authorizationPolicies: {
    '/api/admin': ['Admin'],
    '/api/user': ['User', 'Admin']
  }
};
