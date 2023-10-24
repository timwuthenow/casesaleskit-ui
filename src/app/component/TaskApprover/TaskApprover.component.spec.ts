/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { TaskApproverComponent } from './TaskApprover.component';

describe('TaskApproverComponent', () => {
  let component: TaskApproverComponent;
  let fixture: ComponentFixture<TaskApproverComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TaskApproverComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TaskApproverComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
