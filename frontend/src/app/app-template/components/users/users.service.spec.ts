import { TestBed } from '@angular/core/testing';
import { UsersService } from './users.service';

/**
 * Lightweight mock to represent authentication/authorization surface for tests.
 *
 * This mock exists to clarify where JWT/cookie-based authentication and role checks
 * would be stubbed during unit tests. It intentionally does not change the behavior
 * of the original test (which only asserts the service is created).
 */
class MockAuthService {
  isAuthenticated(): boolean {
    return true;
  }

  hasRole(role: string): boolean {
    return role === 'user';
  }

  getToken(): string {
    return 'mock-jwt-token';
  }
}

describe('UsersService', () => {
  let service: UsersService | null = null;
  let mockAuth: MockAuthService | null = null;

  beforeEach(() => {
    TestBed.configureTestingModule({
      // Provide the mock to make authentication/authorization explicit in tests.
      // This does not override existing application providers — it only makes a
      // dedicated mock available for tests that might need it.
      providers: [MockAuthService]
    });

    service = TestBed.inject(UsersService);
    mockAuth = TestBed.inject(MockAuthService);
  });

  afterEach(() => {
    // Clean up references to help tests remain isolated.
    service = null;
    mockAuth = null;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
