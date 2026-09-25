import { TestBed } from '@angular/core/testing';
import { BookingServices } from './booking.services';

describe('BookingServices', () => {
  let service: BookingServices;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BookingServices);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
