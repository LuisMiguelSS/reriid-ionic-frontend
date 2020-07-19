import { TestBed } from '@angular/core/testing';

import { ImagepickerService } from './imagepicker.service';

describe('ImagepickerService', () => {
  let service: ImagepickerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ImagepickerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
