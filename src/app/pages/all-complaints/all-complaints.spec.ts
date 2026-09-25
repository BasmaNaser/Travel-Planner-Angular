import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AllComplaints } from './all-complaints';

describe('AllComplaints', () => {
  let component: AllComplaints;
  let fixture: ComponentFixture<AllComplaints>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AllComplaints],
    }).compileComponents();

    fixture = TestBed.createComponent(AllComplaints);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
