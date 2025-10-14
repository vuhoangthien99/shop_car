import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Dangkylaithu } from './dangkylaithu';

describe('Dangkylaithu', () => {
  let component: Dangkylaithu;
  let fixture: ComponentFixture<Dangkylaithu>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Dangkylaithu]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Dangkylaithu);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
