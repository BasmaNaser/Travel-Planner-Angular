import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdminBooking } from './admin-booking';

describe('AdminBooking', () => {
  let component: AdminBooking;
  let fixture: ComponentFixture<AdminBooking>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminBooking],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminBooking);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
