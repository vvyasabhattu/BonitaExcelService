import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { KendoComponentComponent } from './kendo-component.component';

describe('KendoComponentComponent', () => {
  let component: KendoComponentComponent;
  let fixture: ComponentFixture<KendoComponentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ KendoComponentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(KendoComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
