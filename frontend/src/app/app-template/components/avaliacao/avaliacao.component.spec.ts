import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { AvaliacaoComponent } from './avaliacao.component';

/**
 * Unit tests for AvaliacaoComponent
 * - Improved readability and maintainability
 * - Simulates a minimal authentication context via localStorage (mock JWT + roles)
 *   so tests can be extended to cover auth/authorization behavior without changing
 *   application code. This does NOT alter component behavior.
 */
describe('AvaliacaoComponent', () => {
  let component: AvaliacaoComponent;
  let fixture: ComponentFixture<AvaliacaoComponent>;

  // A lightweight fake JWT for tests. This is a harmless placeholder token.
  const TEST_JWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dGVzdC1wYXlsb2Fk.signature';
  const ROLE_ADMIN = 'admin';

  beforeEach(
    waitForAsync(async () => {
      // Prepare a minimal mock authentication context. Tests relying on auth
      // can be added later. This does not change the existing test expectation.
      setMockAuthToken(ROLE_ADMIN);

      await configureTestingModule();
      createComponent();
    })
  );

  afterEach(() => {
    clearMockAuthToken();

    // Ensure fixture is properly disposed between tests.
    if (fixture) {
      fixture.destroy();
    }
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // --- Helpers ---

  async function configureTestingModule(): Promise<void> {
    // Keep declarations minimal and explicit. If native dependencies are
    // required by AvaliacaoComponent in the future, add them here.
    await TestBed.configureTestingModule({
      declarations: [AvaliacaoComponent],
      // Providers for AuthService / Guards can be added here in real app tests.
    }).compileComponents();
  }

  function createComponent(): void {
    fixture = TestBed.createComponent(AvaliacaoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  /**
   * Store a mock JWT and optional roles in localStorage to simulate auth.
   * Tests run in Node/Jest/Browser environments may ignore localStorage errors.
   */
  function setMockAuthToken(role?: string): void {
    try {
      localStorage.setItem('auth_token', TEST_JWT);
      if (role) {
        localStorage.setItem('user_roles', JSON.stringify([role]));
      } else {
        localStorage.removeItem('user_roles');
      }
    } catch {
      // localStorage may not be available in some test runners — ignore silently.
    }
  }

  function clearMockAuthToken(): void {
    try {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_roles');
    } catch {
      // ignore errors when clearing local storage in non-browser environments
    }
  }
});
