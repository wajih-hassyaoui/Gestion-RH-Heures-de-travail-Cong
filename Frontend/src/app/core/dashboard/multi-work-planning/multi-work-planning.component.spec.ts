import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MultiWorkPlanningComponent } from './multi-work-planning.component';

describe('MultiWorkPlanningComponent', () => {
  let component: MultiWorkPlanningComponent;
  let fixture: ComponentFixture<MultiWorkPlanningComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MultiWorkPlanningComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MultiWorkPlanningComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
