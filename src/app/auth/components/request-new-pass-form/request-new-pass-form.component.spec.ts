import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RequestNewPassFormComponent } from './request-new-pass-form.component';

describe('RequestNewPassFormComponent', () => {
  let component: RequestNewPassFormComponent;
  let fixture: ComponentFixture<RequestNewPassFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RequestNewPassFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RequestNewPassFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
