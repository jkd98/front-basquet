import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RequestNewPassPageComponent } from './request-new-pass-page.component';

describe('RequestNewPassPageComponent', () => {
  let component: RequestNewPassPageComponent;
  let fixture: ComponentFixture<RequestNewPassPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RequestNewPassPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RequestNewPassPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
