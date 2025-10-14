import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Trangchu } from './trangchu';

describe('Trangchu', () => {
  let component: Trangchu;
  let fixture: ComponentFixture<Trangchu>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Trangchu]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Trangchu);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
