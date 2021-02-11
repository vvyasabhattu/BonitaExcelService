import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AllMandatesComponent } from './all-mandates.component';

describe('AllMandatesComponent', () => {
  let component: AllMandatesComponent;
  let fixture: ComponentFixture<AllMandatesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AllMandatesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AllMandatesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
