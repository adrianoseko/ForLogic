import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { FavoriteAppsComponent } from './favorite-apps.component';

/**
 * Lightweight mock for future authentication/authorization usage in tests.
 * This is a test-side stub only and does not change production behavior.
 */
class MockAuthService {
  isAuthenticated(): boolean {
    return true;
  }

  hasRole(_role: string): boolean {
    return false;
  }
}

describe('FavoriteAppsComponent', () => {
  let component: FavoriteAppsComponent;
  let fixture: ComponentFixture<FavoriteAppsComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [FavoriteAppsComponent],
        // Provide a mock auth service so tests can be extended to assert
        // auth/role behavior without touching production code.
        providers: [{ provide: MockAuthService, useClass: MockAuthService }],
        // Ignore unknown elements/attributes to keep the unit test focused
        // on this component and avoid importing unrelated modules.
        schemas: [NO_ERRORS_SCHEMA],
      }).compileComponents();
    })
  );

  function createComponent(): void {
    fixture = TestBed.createComponent(FavoriteAppsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  beforeEach(() => {
    createComponent();
  });

  afterEach(() => {
    // Ensure the fixture is cleaned up between tests to avoid leaks.
    if (fixture) {
      fixture.destroy();
    }
  });

  it('should create the FavoriteAppsComponent', () => {
    expect(component).toBeTruthy();
  });
});
