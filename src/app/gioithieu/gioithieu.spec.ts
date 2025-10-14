import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Gioithieu } from './gioithieu';

describe('Gioithieu', () => {
  let component: Gioithieu;
  let fixture: ComponentFixture<Gioithieu>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Gioithieu]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Gioithieu);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
