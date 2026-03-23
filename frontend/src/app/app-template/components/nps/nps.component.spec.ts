import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NO_ERRORS_SCHEMA, Injectable } from '@angular/core';
import { NpsComponent } from './nps.component';

/**
 * Lightweight mocks to represent authentication and role/authorization providers.
 * These are intentionally simple and only added to demonstrate how authentication
 * and role-based policies could be wired into component test setups without
 * changing the existing test behavior.
 */
@Injectable()
class MockAuthService {
  isAuthenticated(): boolean {
    return true;
  }
  getToken(): string {
    return 'mock-jwt-token';
  }
}

@Injectable()
class MockRoleService {
  hasRole(role: string): boolean {
    // Return true only for an example role; keep behavior minimal and deterministic
    return role === 'admin';
  }
}

describe('NpsComponent', () => {
  let component: NpsComponent;
  let fixture: ComponentFixture<NpsComponent>;

  // Configure the TestBed once per suite. Using waitForAsync to ensure async
  // compilation/initialization errors are surfaced properly.
  beforeEach(
    waitForAsync(async () => {
      try {
        await TestBed.configureTestingModule({
          imports: [RouterTestingModule],
          declarations: [NpsComponent],
          providers: [
            // Provide mock services to demonstrate authentication/authorization
            // wiring in the test environment without affecting behavior.
            { provide: 'AuthService', useClass: MockAuthService },
            { provide: 'RoleService', useClass: MockRoleService },
          ],
          // Ignore unknown elements/attributes in shallow component tests for stability
          schemas: [NO_ERRORS_SCHEMA],
        }).compileComponents();
      } catch (error) {
        // Re-throw to ensure failing test setups are visible to the test runner
        throw error;
      }
    })
  );

  // Helper to create and initialize the component under test. Keeps setup DRY.
  function createComponent(): void {
    fixture = TestBed.createComponent(NpsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  beforeEach(() => {
    createComponent();
  });

  it('creates the NpsComponent instance', () => {
    expect(component).toBeTruthy();
  });
});
