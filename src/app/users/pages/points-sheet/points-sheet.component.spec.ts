import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PointsSheetComponent } from './points-sheet.component';

describe('PointsSheetComponent', () => {
  let component: PointsSheetComponent;
  let fixture: ComponentFixture<PointsSheetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PointsSheetComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PointsSheetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
