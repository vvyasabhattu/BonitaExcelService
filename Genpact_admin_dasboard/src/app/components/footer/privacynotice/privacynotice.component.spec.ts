import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PrivacynoticeComponent } from './privacynotice.component';

describe('PrivacynoticeComponent', () => {
  let component: PrivacynoticeComponent;
  let fixture: ComponentFixture<PrivacynoticeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PrivacynoticeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PrivacynoticeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
