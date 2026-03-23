/*
  frontend/src/app/app-template/pages/home/home.ts

  Refactored: Improved typing, separation of concerns, added authentication/authorization utilities
  Note: The Home class preserves exact original behavior. The additional auth/CORS utilities are provided
  as reusable, environment-aware helpers for controller/back-end integration. They are not invoked by Home
  to preserve behavior.
*/

// Roles that can be used by authorization policies
export enum Role {
  Guest = 'guest',
  User = 'user',
  Admin = 'admin'
}

// Minimal user representation used by auth utilities
export interface IUser {
  id: string;
  username?: string;
  roles: Role[];
}

// TokenVerifier is an abstraction over JWT or cookie verification logic
// Implementations should verify signature, expiry, and return a IUser or null.
export type TokenVerifier = (token: string) => Promise<IUser | null>;

// Factory for authentication middleware compatible with Express-like controllers.
// The function returns an async middleware that extracts a token from Authorization header (Bearer) or cookies.
// The default tokenVerifier is a permissive no-op that treats requests as unauthenticated (null user).
// For production, inject a proper verifier that validates JWTs or session cookies.
export function createAuthMiddleware(tokenVerifier: TokenVerifier) {
  // Use function with any types to avoid forcing an Express dependency in this front-end shared file.
  return async function authMiddleware(req: any, res: any, next: any): Promise<void> {
    try {
      const header = req?.headers?.authorization as string | undefined;
      let token: string | undefined;

      if (header && header.startsWith('Bearer ')) {
        token = header.slice(7).trim();
      } else if (req?.cookies?.token) {
        token = req.cookies.token;
      }

      if (!token) {
        // No token: attach null user and continue. Controllers/middlewares can enforce required auth via authorizeRoles.
        req.user = null;
        return next();
      }

      const user = await tokenVerifier(token);
      req.user = user; // will be null if verification failed
      return next();
    } catch (err) {
      // Avoid leaking internals; pass error to next handler
      return next(err);
    }
  };
}

// Authorization middleware: ensures the current request user has at least one of the allowed roles.
// If the user is missing or doesn't have required roles, responds with 403 via next(error).
export function authorizeRoles(...allowedRoles: Role[]) {
  return function authorizationMiddleware(req: any, res: any, next: any): void {
    try {
      const user: IUser | null | undefined = req?.user ?? null;

      if (!user) {
        const err = new Error('Unauthorized: authentication required.');
        // Attach a status to be handled by upstream error handlers
        (err as any).status = 401;
        return next(err);
      }

      const hasRole = user.roles.some((r) => allowedRoles.includes(r));

      if (!hasRole) {
        const err = new Error('Forbidden: insufficient privileges.');
        (err as any).status = 403;
        return next(err);
      }

      return next();
    } catch (err) {
      return next(err);
    }
  };
}

// CORS configuration helper that selects allowed origins based on environment
export class CorsConfig {
  // In production, do NOT use wildcard. Replace the placeholder with your actual domain(s).
  private static readonly productionAllowedOrigins = [
    // TODO: replace with real production origins, e.g. 'https://app.example.com'
    'https://yourdomain.com'
  ];

  // In development allow localhost ports used by front-end dev servers.
  private static readonly developmentAllowedOrigins = [
    'http://localhost:4200',
    'http://localhost:3000'
  ];

  public static getAllowedOrigins(): string[] {
    const env = (process && (process.env as any)?.NODE_ENV) || 'development';
    if (env === 'production') {
      return CorsConfig.productionAllowedOrigins;
    }
    return CorsConfig.developmentAllowedOrigins;
  }

  // Helper to check a single origin against the allowed list
  public static isOriginAllowed(origin: string | undefined): boolean {
    if (!origin) return false;
    return CorsConfig.getAllowedOrigins().includes(origin);
  }
}

// ----------------------------------------------------------------------------------
// The Home class: refactored for clarity but behavior preserved exactly.
// - render(): returns a JSON string with title and content
// - updateContent(newContent): throws Error if newContent is empty/falsy; otherwise updates content
// ----------------------------------------------------------------------------------

export interface IRenderable {
  render(): string;
}

export class Home implements IRenderable {
  private title: string;
  private content: string;

  constructor(title: string, content: string) {
    this.title = title;
    this.content = content;
  }

  public render(): string {
    // Preserve original behavior: return a JSON string with title and content
    return JSON.stringify({ title: this.title, content: this.content });
  }

  public updateContent(newContent: string): void {
    // Preserve original validation behavior: throw when newContent is falsy
    if (!newContent) {
      throw new Error('Content cannot be empty.');
    }
    this.content = newContent;
  }

  // Convenience accessors added for maintainability (do not change the class external behavior)
  public getTitle(): string {
    return this.title;
  }

  public getContent(): string {
    return this.content;
  }
}

// Default permissive token verifier (no verification).
// IMPORTANT: Replace with a real verifier in production. This is provided so the utilities are usable
// without forcing a dependency on specific JWT libraries in this shared file.
export const permissiveTokenVerifier: TokenVerifier = async (_token: string) => {
  // Return null to indicate unauthenticated by default.
  return null;
};
