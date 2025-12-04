import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JoinSeasonModalComponent } from './join-season-modal.component';

describe('JoinSeasonModalComponent', () => {
  let component: JoinSeasonModalComponent;
  let fixture: ComponentFixture<JoinSeasonModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JoinSeasonModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(JoinSeasonModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
