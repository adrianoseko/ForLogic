/*
 * Unit tests for NpsService.
 *
 * NOTE:
 * - This is a frontend unit test file. Authentication (JWT or cookie-based),
 *   role-based authorization for controller endpoints, and CORS restrictions
 *   must be implemented on the server side (backend). Keep production
 *   configuration strict (no AllowAll CORS) and use environment-specific
 *   configuration to separate dev and prod settings.
 */

import { TestBed } from '@angular/core/testing';
import { NpsService } from './nps.service';

describe('NpsService', () => {
  let service: NpsService | null = null;

  beforeEach(() => {
    // Configure TestBed explicitly for clarity and future extension.
    TestBed.configureTestingModule({
      // Provide the service explicitly to make the dependency clear in tests.
      providers: [NpsService],
    });

    // Inject the service under test.
    service = TestBed.inject(NpsService);
  });

  afterEach(() => {
    // Clean up references to help with deterministic GC during test runs.
    service = null;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
