import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EbrochuresComponent } from './ebrochures.component';

describe('EbrochuresComponent', () => {
  let component: EbrochuresComponent;
  let fixture: ComponentFixture<EbrochuresComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EbrochuresComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EbrochuresComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
