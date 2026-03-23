import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ClientService } from './cliente.service';

/**
 * Minimal mock authentication service used only for unit-test configuration.
 * This keeps tests isolated from real authentication backends and demonstrates
 * how JWT/cookie based auth & role checks could be injected into services/components.
 *
 * Note: This mock is for test configuration only and does not change existing
 * test behavior — the existing "should be created" test still verifies service
 * instantiation only.
 */
class MockAuthService {
  private readonly token: string | null = 'mock-jwt-token';
  private readonly roles = new Set<string>(['user']);

  isAuthenticated(): boolean {
    return !!this.token;
  }

  getToken(): string | null {
    return this.token;
  }

  hasRole(role: string): boolean {
    return this.roles.has(role);
  }
}

describe('ClientService', () => {
  let service: ClientService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      // Importing HttpClientTestingModule ensures any HttpClient usage in
      // ClientService is satisfied and test isolation is maintained.
      imports: [HttpClientTestingModule],
      providers: [
        ClientService,
        // Provide the mock auth service for potential auth-related injections.
        // This does not alter the original behavior of the simple "created" test.
        { provide: MockAuthService, useClass: MockAuthService }
      ]
    });

    service = TestBed.inject(ClientService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
