/*
 * Unit tests for AvaliacaoService
 * Notes:
 * - This spec preserves the original behavior (verifies service creation).
 * - Authentication (JWT/cookie) and role-based authorization should be implemented
 *   at the API/controller layer and integrated with the frontend services that
 *   call those APIs. Environment-specific CORS policies must be configured on
 *   the server; do not use AllowAll in production. These concerns are noted
 *   here for developers but are intentionally not changed in this test spec.
 */

import { TestBed } from '@angular/core/testing';
import { AvaliacaoService } from './avaliacao.service';

describe('AvaliacaoService', () => {
  let service: AvaliacaoService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AvaliacaoService]
    });

    // Use typed inject for clarity
    service = TestBed.inject<AvaliacaoService>(AvaliacaoService);
  });

  afterEach(() => {
    // Reset testing module to ensure isolation between tests
    TestBed.resetTestingModule();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
