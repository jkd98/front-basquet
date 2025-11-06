import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormNewPassComponent } from './form-new-pass.component';

describe('FormNewPassComponent', () => {
  let component: FormNewPassComponent;
  let fixture: ComponentFixture<FormNewPassComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormNewPassComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormNewPassComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
