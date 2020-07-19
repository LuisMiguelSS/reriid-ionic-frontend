import { TestBed } from '@angular/core/testing';

import { InternalAPIService } from './internal-api.service';

describe('InternalAPIService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: InternalAPIService = TestBed.get(InternalAPIService);
    expect(service).toBeTruthy();
  });
});
