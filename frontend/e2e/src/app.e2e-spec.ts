import { AppPage } from './app.po';
import { browser, logging } from 'protractor';

// Expected app title shown in the app under test. Keep exact value to preserve behavior.
const EXPECTED_WELCOME_MESSAGE = 'angularproj app is running!';

// Environment-aware constants (used for guidance in tests).
// NOTE: Real CORS restrictions and dev/prod configuration must be implemented on the server
// side. Tests can reference these constants to ensure they target the correct test environment.
const IS_PRODUCTION = process.env.NODE_ENV === 'production';
const ALLOWED_ORIGINS = IS_PRODUCTION
  ? ['https://your-production-origin.com'] // replace with your real production origins
  : ['http://localhost:4200'];

describe('Workspace Project Application', () => {
  let page: AppPage;

  beforeEach(async (): Promise<void> => {
    page = new AppPage();
  });

  it('should display the welcome message', async (): Promise<void> => {
    await page.navigateTo();
    const titleText: string = await page.getTitleText();
    expect(titleText).toEqual(EXPECTED_WELCOME_MESSAGE);
  });

  afterEach(async (): Promise<void> => {
    // Ensure we capture and fail on any severe browser console errors.
    // Wrap in try/catch to add clarity and allow rethrowing with preserved behavior.
    try {
      await verifyNoBrowserErrors();
    } catch (err) {
      // Rethrow so the test framework records the failure. Keeping behavior identical.
      throw err;
    }
  });

  // Utility: verify there are no SEVERE browser console errors.
  async function verifyNoBrowserErrors(): Promise<void> {
    const logs = await browser.manage().logs().get(logging.Type.BROWSER);
    const severeErrors = logs.filter(log => log.level === logging.Level.SEVERE);
    expect(severeErrors.length).toBe(0);
  }

  // ---------- Authentication & Role helpers (test utilities) ----------
  // The application server should implement proper authentication (JWT or secure cookies)
  // and role-based authorization. Tests can leverage helpers like the ones below to set
  // up authenticated state before navigating to protected pages. These helpers are
  // intentionally side-effect free unless called by a test, so current test behavior
  // remains unchanged.

  // Set an authentication token in both cookie and localStorage so the app or server
  // can pick it up as needed. This is optional and not used in the current test.
  async function setAuthToken(token: string, name = 'auth_token'): Promise<void> {
    if (!token) {
      throw new Error('setAuthToken requires a valid token string');
    }

    // Set as cookie for server-side cookie-based auth.
    await browser.manage().addCookie({ name, value: token });

    // Also set in localStorage for client-side JWT-based auth.
    await browser.executeScript((k: string, v: string) => {
      window.localStorage.setItem(k, v);
    }, name, token);
  }

  // Build a minimal (unsigned) JWT-like token payload for tests that need a role value.
  // NOTE: For real authorization tests, obtain properly signed tokens from a test auth service
  // or mock the auth on the backend. This helper is a convenience and does NOT provide
  // real cryptographic signatures.
  function buildJwtPayloadForRole(role: string): string {
    const header = { alg: 'HS256', typ: 'JWT' };
    const payload = { role, iat: Math.floor(Date.now() / 1000) };

    const toBase64Url = (obj: any) => {
      // Use Node Buffer for base64url encoding in test runner environment.
      // In a browser environment, a different approach may be required.
      // Keep this utility isolated so production auth remains on the server.
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const Buffer = require('buffer').Buffer;
      return Buffer.from(JSON.stringify(obj)).toString('base64url');
    };

    return `${toBase64Url(header)}.${toBase64Url(payload)}.signature`;
  }

  // Example usage (commented):
  // const token = buildJwtPayloadForRole('admin');
  // await setAuthToken(token);
  // await page.navigateTo();

  // --------------------------------------------------------------------
});
