import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Sanpham } from './sanpham';

describe('Sanpham', () => {
  let component: Sanpham;
  let fixture: ComponentFixture<Sanpham>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Sanpham]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Sanpham);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
