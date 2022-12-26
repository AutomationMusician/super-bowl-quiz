import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScoreboardRowComponent } from './scoreboard-row.component';

describe('ScoreboardRowComponent', () => {
  let component: ScoreboardRowComponent;
  let fixture: ComponentFixture<ScoreboardRowComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ScoreboardRowComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScoreboardRowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
