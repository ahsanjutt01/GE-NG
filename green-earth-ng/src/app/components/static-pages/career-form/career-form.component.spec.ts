import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CareerFormComponent } from './career-form.component';

describe('CareerFormComponent', () => {
  let component: CareerFormComponent;
  let fixture: ComponentFixture<CareerFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CareerFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CareerFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
