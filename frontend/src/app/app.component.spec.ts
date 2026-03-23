/*
 * Refactored unit test for AppComponent
 *
 * Notes for maintainers:
 * - This file only contains tests and should NOT contain production security logic.
 * - Per project security requirements, authentication (JWT or secure cookie-based)
 *   and role-based authorization must be implemented on the backend/controller layer.
 * - CORS should be restricted to known origins in production and configuration
 *   separated securely for dev and prod (do NOT use AllowAll in production).
 * - Consider adding integration/e2e tests that exercise auth-protected endpoints and
 *   role-based behavior. Those tests belong outside of unit tests and require a
 *   test server with the appropriate auth scaffolding.
 */

import { TestBed, ComponentFixture } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AppComponent } from './app.component';

describe('AppComponent', () => {
  let fixture: ComponentFixture<AppComponent>;
  let component: AppComponent;

  const EXPECTED_TITLE = 'angularproj';
  const EXPECTED_RENDERED_TEXT = 'angularproj app is running!';

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [AppComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
  });

  it('should create the app', () => {
    expect(component).toBeTruthy();
  });

  it(`should have as title '${EXPECTED_TITLE}'`, () => {
    expect(component.title).toEqual(EXPECTED_TITLE);
  });

  it('should render title', () => {
    fixture.detectChanges();
    const compiled: HTMLElement = fixture.nativeElement as HTMLElement;
    const span = compiled.querySelector('.content span');

    // Defensive check before accessing textContent to avoid runtime errors
    expect(span).toBeTruthy();
    expect(span!.textContent).toContain(EXPECTED_RENDERED_TEXT);
  });
});
