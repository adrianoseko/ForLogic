import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { HomeComponent } from './home.component';

// Simulated storage keys for authentication-related tests. This does NOT change
// application behavior; it only ensures tests run in a slightly more realistic
// environment when components read tokens from storage.
const MOCK_JWT_KEY = 'auth_token';
const MOCK_JWT_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mock.payload';

describe('HomeComponent', () => {
  let fixture: ComponentFixture<HomeComponent>;
  let component: HomeComponent;

  // Use waitForAsync to handle asynchronous compilation in a stable way.
  beforeEach(waitForAsync(async () => {
    // Simulate an authenticated state (JWT in localStorage). Tests remain
    // functionally identical; this prepares the environment for components
    // that might check auth state on init.
    localStorage.setItem(MOCK_JWT_KEY, MOCK_JWT_TOKEN);

    await TestBed.configureTestingModule({
      declarations: [HomeComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    // Ensure no state leakage between tests.
    if (fixture) {
      fixture.destroy();
    }
    localStorage.removeItem(MOCK_JWT_KEY);
    TestBed.resetTestingModule();
  });

  it('should create the HomeComponent', () => {
    expect(component).toBeTruthy();
  });
});
