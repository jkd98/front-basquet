import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PageTwoFaComponent } from './page-two-fa.component';

describe('PageTwoFaComponent', () => {
  let component: PageTwoFaComponent;
  let fixture: ComponentFixture<PageTwoFaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PageTwoFaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PageTwoFaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
