import { TestBed } from '@angular/core/testing';
import { MenubarService } from './menubar.service';

/**
 * Unit tests for MenubarService
 *
 * Notes / best-practices applied in this file:
 * - Added explicit typing and cleanup to improve test clarity and reliability.
 * - Included a lightweight MockAuthService to demonstrate how authentication/role
 *   information can be provided to services during tests without changing runtime
 *   behavior. (This does NOT change application behavior; it's only available to
 *   the testbed.)
 * - Left a short note here about backend concerns (authentication, role-based
 *   authorization, and CORS). Those must be implemented on the server-side and
 *   in environment-specific configuration files; see project backend/config files.
 */

// Lightweight mock demonstrating a minimal auth surface for tests.
class MockAuthService {
  private _token = 'mock-jwt-token';
  private _roles: string[] = ['user'];

  isAuthenticated(): boolean {
    return true;
  }

  getToken(): string {
    return this._token;
  }

  getRoles(): string[] {
    return [...this._roles];
  }
}

describe('MenubarService', () => {
  let service: MenubarService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      // Provide the mock auth service to the test dependency injection container.
      // Note: This is intentionally non-invasive: if MenubarService does not
      // depend on an auth provider, this extra provider will be ignored.
      providers: [{ provide: 'MockAuthService', useClass: MockAuthService }]
    });

    service = TestBed.inject(MenubarService);
  });

  afterEach(() => {
    // Ensure no state leaks between tests.
    TestBed.resetTestingModule();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
