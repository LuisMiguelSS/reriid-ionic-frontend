import { TestBed } from '@angular/core/testing';

import { PostdetailService } from './postdetail.service';

describe('PostdetailService', () => {
  let service: PostdetailService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PostdetailService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
