import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DestinationCard } from './destination-card';

describe('DestinationCard', () => {
  let component: DestinationCard;
  let fixture: ComponentFixture<DestinationCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DestinationCard],
    }).compileComponents();

    fixture = TestBed.createComponent(DestinationCard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
