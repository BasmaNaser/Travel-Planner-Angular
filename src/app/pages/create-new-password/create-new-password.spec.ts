import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CreateNewPassword } from './create-new-password';

describe('CreateNewPassword', () => {
  let component: CreateNewPassword;
  let fixture: ComponentFixture<CreateNewPassword>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateNewPassword],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateNewPassword);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
