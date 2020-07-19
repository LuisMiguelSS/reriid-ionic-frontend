import { TestBed } from '@angular/core/testing';

import { AuthenticatorService } from './authenticator.service';

describe('AuthenticatorService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: AuthenticatorService = TestBed.get(AuthenticatorService);
    expect(service).toBeTruthy();
  });
});
