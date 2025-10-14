import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Chitietsanpham } from './chitietsanpham';

describe('Chitietsanpham', () => {
  let component: Chitietsanpham;
  let fixture: ComponentFixture<Chitietsanpham>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Chitietsanpham]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Chitietsanpham);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
