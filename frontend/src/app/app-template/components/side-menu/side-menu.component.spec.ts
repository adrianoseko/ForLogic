import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { InjectionToken, NO_ERRORS_SCHEMA } from '@angular/core';
import { SideMenuComponent } from './side-menu.component';

// Test-only authentication token and interfaces to simulate auth + roles.
// This allows adding authentication/authorization test hooks without changing
// the application code. The component under test is not modified; the mock
// is provided to the testing module so tests can evolve to cover auth-based
// behaviors in the future.
const AUTH_SERVICE = new InjectionToken<AuthService>('AUTH_SERVICE');

interface AuthService {
  isAuthenticated(): boolean;
  getToken(): string | null;
  getUserRoles(): string[];
}

class MockAuthService implements AuthService {
  isAuthenticated(): boolean {
    return true;
  }

  getToken(): string | null {
    // Return a deterministic fake token for tests that may assert header logic.
    return 'fake-jwt-token';
  }

  getUserRoles(): string[] {
    // Default to a basic user role; tests can override the provider if needed.
    return ['user'];
  }
}

describe('SideMenuComponent', () => {
  let component: SideMenuComponent;
  let fixture: ComponentFixture<SideMenuComponent>;
  let authService: AuthService;

  beforeEach(
    waitForAsync(async () => {
      await TestBed.configureTestingModule({
        declarations: [SideMenuComponent],
        providers: [{ provide: AUTH_SERVICE, useClass: MockAuthService }],
        // Ignore unknown child components/attributes to keep the spec focused
        // on this component and to improve isolation.
        schemas: [NO_ERRORS_SCHEMA],
      }).compileComponents();

      // Grab the test auth service so future tests can assert or modify it.
      authService = TestBed.inject(AUTH_SERVICE);
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(SideMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    // Clean up the fixture and testing module to avoid leakage between tests.
    if (fixture) {
      fixture.destroy();
    }
    TestBed.resetTestingModule();
  });

  it('should create the SideMenu component', () => {
    expect(component).toBeTruthy();
  });
});
