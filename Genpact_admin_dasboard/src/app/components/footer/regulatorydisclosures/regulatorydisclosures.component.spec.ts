import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RegulatorydisclosuresComponent } from './regulatorydisclosures.component';

describe('RegulatorydisclosuresComponent', () => {
  let component: RegulatorydisclosuresComponent;
  let fixture: ComponentFixture<RegulatorydisclosuresComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RegulatorydisclosuresComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RegulatorydisclosuresComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
