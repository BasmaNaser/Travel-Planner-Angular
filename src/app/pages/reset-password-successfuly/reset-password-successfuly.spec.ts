import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ResetPasswordSuccessfuly } from './reset-password-successfuly';

describe('ResetPasswordSuccessfuly', () => {
  let component: ResetPasswordSuccessfuly;
  let fixture: ComponentFixture<ResetPasswordSuccessfuly>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResetPasswordSuccessfuly],
    }).compileComponents();

    fixture = TestBed.createComponent(ResetPasswordSuccessfuly);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
