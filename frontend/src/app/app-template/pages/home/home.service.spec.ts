/*
  Unit tests for HomeService
  - Uses HttpClientTestingModule to isolate HTTP dependencies.
  - Includes a lightweight mocked AuthService used to demonstrate JWT-based auth in tests.

  Security notes (guidance only - backend changes required):
  - Enforce authentication (JWT or secure cookies) and role-based authorization on controller endpoints.
  - Restrict CORS to known/trusted origins in production. Keep a permissive "AllowAll" only for local/dev environments and never in production.
  - Separate dev/production configuration via environment files or secure configuration stores. Do not store secrets or live tokens in source.
*/

import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Injectable } from '@angular/core';
import { HomeService } from './home.service';

@Injectable()
class MockAuthService {
  /**
   * Return a stable, non-sensitive token for tests. Do not use real tokens here.
   */
  getToken(): string {
    return 'mock-jwt-token';
  }

  /**
   * Simulate role checks in tests. Tests can override behavior when needed.
   */
  hasRole(_role: string): boolean {
    return true;
  }
}

describe('HomeService', () => {
  let service: HomeService;

  beforeEach((): void => {
    TestBed.configureTestingModule({
      // Importing HttpClientTestingModule isolates the service from real HTTP calls
      imports: [HttpClientTestingModule],
      // Provide lightweight mocks to demonstrate how authentication-related
      // dependencies can be injected in tests without hitting real auth layers.
      providers: [MockAuthService]
    });

    service = TestBed.inject(HomeService);
  });

  afterEach((): void => {
    // Reset the testing module to avoid shared state between tests
    TestBed.resetTestingModule();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
