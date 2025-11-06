import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewPassPageComponent } from './new-pass-page.component';

describe('NewPassPageComponent', () => {
  let component: NewPassPageComponent;
  let fixture: ComponentFixture<NewPassPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewPassPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewPassPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
