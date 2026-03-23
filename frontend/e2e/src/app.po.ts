import { browser, by, element, ElementFinder } from 'protractor';

interface AuthOptions {
  role?: string;
  tokenKey?: string; // cookie name or localStorage key
  expiresInSeconds?: number;
}

/**
 * Page Object for the root App page used in E2E tests.
 *
 * Responsibilities:
 * - Provide navigation helper(s) for the app root
 * - Provide DOM accessors for assertions
 * - Helpers to manage test authentication (set/clear JWT cookie)
 *
 * Notes:
 * - Added lightweight test JWT creation helper to allow tests to set a cookie
 *   representing an authenticated user with a role. This is strictly for
 *   e2e test setup and does not attempt to provide production-grade JWT
 *   signing/verification.
 */
export class AppPage {
  private readonly contentElement: ElementFinder;
  private readonly defaultAuthCookieName = 'e2e_auth_token';

  constructor() {
    this.contentElement = element(by.css('app-root .content span'));
  }

  /**
   * Navigate to the base URL configured for Protractor.
   * Preserves original behavior (no arguments) for existing tests.
   */
  async navigateTo(): Promise<void> {
    await browser.get(browser.baseUrl);
  }

  /**
   * Read the text content from the page's content span.
   */
  async getTitleText(): Promise<string> {
    return await this.contentElement.getText();
  }

  /**
   * Set an authentication token as a cookie so that E2E tests can simulate
   * an authenticated user with a given role.
   *
   * This helper does not alter existing behavior of navigateTo() or
   * getTitleText(); it's an additive helper for test setup.
   */
  async setAuthToken(options: AuthOptions = {}): Promise<void> {
    const role = options.role ?? 'user';
    const tokenKey = options.tokenKey ?? this.defaultAuthCookieName;
    const expiresIn = options.expiresInSeconds ?? 60 * 60; // default 1 hour

    const token = this.createTestJwt({ role, expiresInSeconds: expiresIn });

    // Use browser.manage().addCookie so the app receives the cookie like a real browser.
    // We scope the cookie to the current baseUrl host/path.
    await browser.manage().addCookie({ name: tokenKey, value: token });
  }

  /**
   * Remove the authentication cookie used by tests.
   */
  async clearAuthToken(tokenKey?: string): Promise<void> {
    const key = tokenKey ?? this.defaultAuthCookieName;
    try {
      await browser.manage().deleteCookie(key);
    } catch (err) {
      // Ensure tests don't fail on cookie deletion issues; keep behavior predictable.
      // In real test run, consider surfacing this error.
      // eslint-disable-next-line no-console
      console.warn(`Failed to delete cookie ${key}:`, err);
    }
  }

  /**
   * Create a lightweight unsigned JWT for test purposes. It encodes a minimal payload
   * including a role and expiry. Signature is a placeholder since we don't validate it
   * in the test environment. Keep this limited to E2E test tooling only.
   */
  private createTestJwt(payloadData: { role: string; expiresInSeconds: number }): string {
    const header = { alg: 'none', typ: 'JWT' };
    const now = Math.floor(Date.now() / 1000);
    const payload = {
      sub: 'e2e-user',
      role: payloadData.role,
      iat: now,
      exp: now + payloadData.expiresInSeconds,
    };

    const encode = (obj: object): string => {
      // base64url encoding
      const json = JSON.stringify(obj);
      const b64 = Buffer.from(json).toString('base64');
      return b64.replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_');
    };

    // signature left empty for test tokens (alg: none)
    return `${encode(header)}.${encode(payload)}.`;
  }
}
