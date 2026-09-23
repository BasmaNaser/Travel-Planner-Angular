import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ForgetPasswordEmail } from './forget-password-email';

describe('ForgetPasswordEmail', () => {
  let component: ForgetPasswordEmail;
  let fixture: ComponentFixture<ForgetPasswordEmail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ForgetPasswordEmail],
    }).compileComponents();

    fixture = TestBed.createComponent(ForgetPasswordEmail);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
