import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormForgotPassComponent } from './form-forgot-pass.component';

describe('FormForgotPassComponent', () => {
  let component: FormForgotPassComponent;
  let fixture: ComponentFixture<FormForgotPassComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormForgotPassComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormForgotPassComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
