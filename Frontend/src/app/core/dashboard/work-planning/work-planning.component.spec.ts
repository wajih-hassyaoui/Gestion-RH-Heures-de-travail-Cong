import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkPlanningComponent } from './work-planning.component';

describe('WorkPlanningComponent', () => {
  let component: WorkPlanningComponent;
  let fixture: ComponentFixture<WorkPlanningComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WorkPlanningComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkPlanningComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
