import { TestBed } from '@angular/core/testing';
import { LoginService } from './login.service';

/**
 * Unit tests for LoginService.
 *
 * Notes:
 * - Authentication (JWT/cookie) and role-based authorization are concerns handled
 *   at the application/integration level (e.g., HTTP interceptors, route guards,
 *   and server-side controllers). They are out of scope for this isolated unit test.
 * - CORS and environment-specific configuration should be restricted in production
 *   via environment files and server settings, not within unit tests.
 */
describe('LoginService', () => {
  let service: LoginService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [LoginService],
    }).compileComponents();

    service = TestBed.inject(LoginService);
  });

  afterEach(() => {
    // Reset TestBed to avoid test pollution between specs
    TestBed.resetTestingModule();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
