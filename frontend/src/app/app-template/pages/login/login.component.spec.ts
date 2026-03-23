import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { LoginComponent } from './login.component';

// Small, local test-side definitions to demonstrate authentication/authorization concerns
// without affecting production code. These are intentionally lightweight mocks used only
// in the unit-test environment to demonstrate JWT/cookie-style authentication and role-based
// concepts per developer instructions. They do not alter the behavior of the original test.

enum Role {
  Admin = 'Admin',
  User = 'User',
}

interface IAuthService {
  // Simulates issuing a JWT (or setting a cookie) for tests
  login(username: string, password: string): Promise<string>;
  // Simulates checking authentication state
  isAuthenticated(): boolean;
  // Returns roles assigned to the current (mock) user
  getUserRoles(): Role[];
}

class MockAuthService implements IAuthService {
  private token: string | null = null;
  private roles: Role[] = [];

  async login(username: string, password: string): Promise<string> {
    // Very simple mock: accept any credentials and return a fake token
    // Preserve deterministic behavior for tests.
    this.token = `mock-token-for-${username}`;
    // Assign User role by default; tests can override if needed.
    this.roles = [Role.User];
    return this.token;
  }

  isAuthenticated(): boolean {
    return this.token !== null;
  }

  getUserRoles(): Role[] {
    return [...this.roles];
  }
}

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;

  beforeEach(
    waitForAsync(async () => {
      // Configure testing module explicitly and safely.
      // NO_ERRORS_SCHEMA prevents the need to declare child components that the
      // LoginComponent may reference; this keeps the test focused on creation.
      await TestBed.configureTestingModule({
        declarations: [LoginComponent],
        providers: [
          // Provide a mock authentication service so tests can opt into auth scenarios
          { provide: MockAuthService, useClass: MockAuthService },
        ],
        schemas: [NO_ERRORS_SCHEMA],
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    // Perform initial change detection to match previous behavior
    fixture.detectChanges();
  });

  afterEach(() => {
    // Reset the testing module to avoid cross-test contamination
    TestBed.resetTestingModule();
  });

  it('should create the LoginComponent', () => {
    expect(component).toBeTruthy();
  });
});
