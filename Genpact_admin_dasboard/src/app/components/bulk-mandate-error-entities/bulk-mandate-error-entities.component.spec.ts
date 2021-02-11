import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BulkMandateErrorEntitiesComponent } from './bulk-mandate-error-entities.component';

describe('BulkMandateErrorEntitiesComponent', () => {
  let component: BulkMandateErrorEntitiesComponent;
  let fixture: ComponentFixture<BulkMandateErrorEntitiesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BulkMandateErrorEntitiesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BulkMandateErrorEntitiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
